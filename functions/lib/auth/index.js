"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authFunctions = exports.validateSession = exports.updateProfile = exports.logout = exports.createCustomToken = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("firebase-admin/auth");
const firebase_1 = require("../config/firebase");
const audit_1 = require("../utils/audit");
const crypto_1 = require("../utils/crypto");
const rateLimit_1 = require("../utils/rateLimit");
const firestore = (0, firebase_1.getFirestoreInstance)();
const auth = (0, auth_1.getAuth)();
// Custom token creation for wallet-based authentication
exports.createCustomToken = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { address, signature, message } = data;
        // Validate input
        if (!address || !signature || !message) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: address, signature, message');
        }
        // Validate Ethereum address format
        if (!(0, crypto_1.validateEthereumAddress)(address)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid Ethereum address format');
        }
        // Rate limiting
        await (0, rateLimit_1.checkRateLimit)('LOGIN_ATTEMPTS', address, 10, 3600); // 10 per hour
        // Verify signature (implement your signature verification logic)
        // This would typically involve verifying the signature against the message
        // Check if user exists in our database
        const userDoc = await firestore.collection('users').where('address', '==', address).get();
        let userId;
        let userData = {};
        if (userDoc.empty) {
            // Create new user
            const newUserDoc = await firestore.collection('users').add({
                address: address.toLowerCase(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'ACTIVE',
                kycStatus: 'NOT_STARTED',
                kycTier: 0,
                riskScore: 0,
                isBlacklisted: false,
                lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
            });
            userId = newUserDoc.id;
            userData = { address: address.toLowerCase(), isNewUser: true };
        }
        else {
            // Update existing user
            const existingUser = userDoc.docs[0];
            userId = existingUser.id;
            userData = existingUser.data();
            // Check if user is blacklisted or suspended
            if (userData.isBlacklisted) {
                throw new functions.https.HttpsError('permission-denied', 'Account is blacklisted');
            }
            if (userData.status === 'SUSPENDED' || userData.status === 'BANNED') {
                throw new functions.https.HttpsError('permission-denied', 'Account is suspended or banned');
            }
            // Update last login
            await firestore.collection('users').doc(userId).update({
                lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        // Create custom claims
        const customClaims = {
            address: address.toLowerCase(),
            kycStatus: userData.kycStatus || 'NOT_STARTED',
            kycTier: userData.kycTier || 0,
            riskScore: userData.riskScore || 0,
            blacklisted: userData.isBlacklisted || false
        };
        // Add admin claim if applicable
        if (userData.isAdmin) {
            customClaims.admin = true;
            customClaims.roles = userData.roles || ['admin'];
        }
        // Create custom token
        const customToken = await auth.createCustomToken(userId, customClaims);
        // Create user session
        const sessionToken = require('crypto').randomBytes(32).toString('hex');
        await firestore.collection('user_sessions').add({
            userId,
            sessionToken,
            ipAddress: ((_a = context.rawRequest) === null || _a === void 0 ? void 0 : _a.ip) || 'unknown',
            userAgent: ((_b = context.rawRequest) === null || _b === void 0 ? void 0 : _b.headers['user-agent']) || 'unknown',
            isActive: true,
            lastActivity: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Audit log
        await (0, audit_1.createAuditLog)({
            action: 'LOGIN',
            entityType: 'user',
            entityId: userId,
            userAddress: address.toLowerCase(),
            ipAddress: ((_c = context.rawRequest) === null || _c === void 0 ? void 0 : _c.ip) || 'unknown',
            userAgent: ((_d = context.rawRequest) === null || _d === void 0 ? void 0 : _d.headers['user-agent']) || 'unknown',
            newData: { loginMethod: 'wallet', sessionToken },
            severity: 'INFO',
            category: 'USER_ACTION'
        });
        return {
            success: true,
            customToken,
            userId,
            sessionToken,
            user: {
                address: address.toLowerCase(),
                kycStatus: userData.kycStatus || 'NOT_STARTED',
                kycTier: userData.kycTier || 0,
                isNewUser: userData.isNewUser || false
            }
        };
    }
    catch (error) {
        console.error('Error creating custom token:', error);
        // Audit security event
        await (0, audit_1.createAuditLog)({
            action: 'SECURITY_EVENT',
            entityType: 'auth',
            entityId: 'login_failure',
            userAddress: (_e = data.address) === null || _e === void 0 ? void 0 : _e.toLowerCase(),
            ipAddress: ((_f = context.rawRequest) === null || _f === void 0 ? void 0 : _f.ip) || 'unknown',
            securityFlags: { flags: ['failed_login'] },
            metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
            severity: 'WARN',
            category: 'SECURITY'
        });
        throw error;
    }
});
// Logout function to invalidate sessions
exports.logout = functions.https.onCall(async (data, context) => {
    var _a;
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const { sessionToken } = data;
        const userId = context.auth.uid;
        // Invalidate session
        if (sessionToken) {
            const sessionQuery = await firestore
                .collection('user_sessions')
                .where('userId', '==', userId)
                .where('sessionToken', '==', sessionToken)
                .get();
            for (const sessionDoc of sessionQuery.docs) {
                await sessionDoc.ref.update({
                    isActive: false,
                    loggedOutAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }
        else {
            // Invalidate all sessions for user
            const sessionsQuery = await firestore
                .collection('user_sessions')
                .where('userId', '==', userId)
                .where('isActive', '==', true)
                .get();
            const batch = firestore.batch();
            for (const sessionDoc of sessionsQuery.docs) {
                batch.update(sessionDoc.ref, {
                    isActive: false,
                    loggedOutAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            await batch.commit();
        }
        // Audit log
        await (0, audit_1.createAuditLog)({
            action: 'LOGOUT',
            entityType: 'user',
            entityId: userId,
            userAddress: context.auth.token.address,
            ipAddress: ((_a = context.rawRequest) === null || _a === void 0 ? void 0 : _a.ip) || 'unknown',
            metadata: { sessionToken: sessionToken || 'all_sessions' },
            severity: 'INFO',
            category: 'USER_ACTION'
        });
        return { success: true };
    }
    catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
});
// Update user profile
exports.updateProfile = functions.https.onCall(async (data, context) => {
    var _a;
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const userId = context.auth.uid;
        const { firstName, lastName, email, phoneNumber } = data;
        // Validate email if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid email format');
        }
        // Check if email already exists
        if (email) {
            const emailQuery = await firestore
                .collection('users')
                .where('email', '==', email)
                .get();
            if (!emailQuery.empty && emailQuery.docs[0].id !== userId) {
                throw new functions.https.HttpsError('already-exists', 'Email address already in use');
            }
        }
        // Get current user data
        const userDoc = await firestore.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }
        const oldData = userDoc.data();
        // Update user profile
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        if (firstName !== undefined)
            updateData.firstName = firstName;
        if (lastName !== undefined)
            updateData.lastName = lastName;
        if (email !== undefined)
            updateData.email = email;
        if (phoneNumber !== undefined)
            updateData.phoneNumber = phoneNumber;
        await firestore.collection('users').doc(userId).update(updateData);
        // Audit log
        await (0, audit_1.createAuditLog)({
            action: 'UPDATE',
            entityType: 'user',
            entityId: userId,
            userAddress: context.auth.token.address,
            ipAddress: ((_a = context.rawRequest) === null || _a === void 0 ? void 0 : _a.ip) || 'unknown',
            oldData: {
                firstName: oldData === null || oldData === void 0 ? void 0 : oldData.firstName,
                lastName: oldData === null || oldData === void 0 ? void 0 : oldData.lastName,
                email: oldData === null || oldData === void 0 ? void 0 : oldData.email,
                phoneNumber: oldData === null || oldData === void 0 ? void 0 : oldData.phoneNumber
            },
            newData: updateData,
            severity: 'INFO',
            category: 'USER_ACTION'
        });
        return { success: true };
    }
    catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
});
// Session validation
exports.validateSession = functions.https.onCall(async (data, context) => {
    var _a;
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const { sessionToken } = data;
        const userId = context.auth.uid;
        if (!sessionToken) {
            throw new functions.https.HttpsError('invalid-argument', 'Session token required');
        }
        // Find and validate session
        const sessionQuery = await firestore
            .collection('user_sessions')
            .where('userId', '==', userId)
            .where('sessionToken', '==', sessionToken)
            .where('isActive', '==', true)
            .get();
        if (sessionQuery.empty) {
            throw new functions.https.HttpsError('not-found', 'Invalid or expired session');
        }
        const session = sessionQuery.docs[0].data();
        // Check if session is expired
        if (session.expiresAt.toDate() < new Date()) {
            // Mark session as inactive
            await sessionQuery.docs[0].ref.update({
                isActive: false,
                expiredAt: admin.firestore.FieldValue.serverTimestamp()
            });
            throw new functions.https.HttpsError('permission-denied', 'Session has expired');
        }
        // Update last activity
        await sessionQuery.docs[0].ref.update({
            lastActivity: admin.firestore.FieldValue.serverTimestamp(),
            ipAddress: ((_a = context.rawRequest) === null || _a === void 0 ? void 0 : _a.ip) || session.ipAddress
        });
        return {
            valid: true,
            expiresAt: session.expiresAt,
            lastActivity: session.lastActivity
        };
    }
    catch (error) {
        console.error('Error validating session:', error);
        throw error;
    }
});
exports.authFunctions = {
    createCustomToken: exports.createCustomToken,
    logout: exports.logout,
    updateProfile: exports.updateProfile,
    validateSession: exports.validateSession
};
//# sourceMappingURL=index.js.map