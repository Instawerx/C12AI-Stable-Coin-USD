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
exports.reviewRoleApplication = exports.calculateMembershipTier = exports.submitDAOApplication = void 0;
const functions = __importStar(require("firebase-functions"));
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
/**
 * Submit a DAO membership application
 */
exports.submitDAOApplication = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const { roleApplication, profileData, purchaseData, walletAddress } = data;
    try {
        // Validate required fields
        if (!roleApplication || !roleApplication.role || !roleApplication.motivation) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required role application data');
        }
        if (!walletAddress) {
            throw new functions.https.HttpsError('invalid-argument', 'Wallet address is required');
        }
        // Calculate tier based on token purchase
        const tier = purchaseData.tier || 'BRONZE';
        const tokenBalance = purchaseData.tokenAmount || 0;
        // Calculate voting power based on role and tier
        let votingPower = tokenBalance / 1000; // Base: 1 vote per 1000 tokens
        // Role multipliers
        const roleMultipliers = {
            MEMBER: 1,
            DEVELOPER: 2,
            ADMIN: 5,
            TRUSTED: 3,
        };
        votingPower *= roleMultipliers[roleApplication.role] || 1;
        // Determine status (MEMBER role is auto-approved)
        const status = roleApplication.role === 'MEMBER' ? 'ACTIVE' : 'PENDING';
        // Create membership document
        const membershipData = {
            userId,
            role: roleApplication.role,
            tier,
            tokenBalance,
            votingPower,
            totalVolume: 0,
            totalTransactions: 0,
            joinDate: firestore_1.FieldValue.serverTimestamp(),
            walletAddress,
            status,
            applicationData: {
                roleApplication,
                profileData,
                purchaseData,
            },
        };
        await db.collection('daoMemberships').doc(userId).set(membershipData);
        // If not a regular member, create role application for review
        if (roleApplication.role !== 'MEMBER') {
            const applicationData = {
                userId,
                role: roleApplication.role,
                status: 'PENDING',
                applicationData: {
                    roleApplication,
                    profileData,
                    walletAddress,
                },
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            };
            await db.collection('roleApplications').add(applicationData);
            // Send notification to admins
            const adminsSnapshot = await db.collection('admins').get();
            const notificationPromises = adminsSnapshot.docs.map((doc) => {
                return db.collection('notifications').add({
                    userId: doc.id,
                    type: 'role_application',
                    title: `New ${roleApplication.role} Application`,
                    message: `A new ${roleApplication.role} application has been submitted and requires review.`,
                    data: {
                        applicantId: userId,
                        role: roleApplication.role,
                    },
                    read: false,
                    createdAt: firestore_1.FieldValue.serverTimestamp(),
                });
            });
            await Promise.all(notificationPromises);
        }
        // Update user document with DAO membership flag
        await db.collection('users').doc(userId).update({
            daoMembership: true,
            daoMembershipId: userId,
            daoRole: roleApplication.role,
            daoTier: tier,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            membershipId: userId,
            status,
            message: status === 'ACTIVE'
                ? 'Membership activated successfully!'
                : `Application submitted! You'll receive a notification within ${getApprovalTime(roleApplication.role)}.`,
        };
    }
    catch (error) {
        console.error('Error submitting DAO application:', error);
        throw new functions.https.HttpsError('internal', 'Failed to submit application');
    }
});
/**
 * Calculate membership tier based on volume and transactions
 */
exports.calculateMembershipTier = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    try {
        const membershipDoc = await db.collection('daoMemberships').doc(userId).get();
        if (!membershipDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Membership not found');
        }
        const membership = membershipDoc.data();
        const { totalVolume, totalTransactions } = membership;
        // Tier thresholds
        const tiers = [
            { name: 'DIAMOND', minVolume: 500000, minTransactions: 1000 },
            { name: 'PLATINUM', minVolume: 100000, minTransactions: 500 },
            { name: 'GOLD', minVolume: 25000, minTransactions: 100 },
            { name: 'SILVER', minVolume: 5000, minTransactions: 25 },
            { name: 'BRONZE', minVolume: 1000, minTransactions: 5 },
        ];
        let newTier = 'BRONZE';
        for (const tier of tiers) {
            if (totalVolume >= tier.minVolume && totalTransactions >= tier.minTransactions) {
                newTier = tier.name;
                break;
            }
        }
        // Update tier if changed
        if (newTier !== membership.tier) {
            await db.collection('daoMemberships').doc(userId).update({
                tier: newTier,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            // Send notification
            await db.collection('notifications').add({
                userId,
                type: 'tier_upgrade',
                title: `Tier Upgraded to ${newTier}!`,
                message: `Congratulations! Your membership tier has been upgraded to ${newTier}.`,
                read: false,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            });
        }
        return {
            success: true,
            tier: newTier,
            previousTier: membership.tier,
            upgraded: newTier !== membership.tier,
        };
    }
    catch (error) {
        console.error('Error calculating tier:', error);
        throw new functions.https.HttpsError('internal', 'Failed to calculate tier');
    }
});
/**
 * Approve or reject a role application (admin only)
 */
exports.reviewRoleApplication = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Check if user is admin
    const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
    if (!adminDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can review applications');
    }
    const { applicationId, approved, notes } = data;
    try {
        const applicationDoc = await db.collection('roleApplications').doc(applicationId).get();
        if (!applicationDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Application not found');
        }
        const application = applicationDoc.data();
        const newStatus = approved ? 'APPROVED' : 'REJECTED';
        // Update application
        await db.collection('roleApplications').doc(applicationId).update({
            status: newStatus,
            reviewedBy: context.auth.uid,
            reviewDate: firestore_1.FieldValue.serverTimestamp(),
            reviewNotes: notes || '',
        });
        // Update membership
        await db.collection('daoMemberships').doc(application.userId).update({
            status: approved ? 'ACTIVE' : 'REJECTED',
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // Send notification to applicant
        await db.collection('notifications').add({
            userId: application.userId,
            type: 'application_reviewed',
            title: `Application ${approved ? 'Approved' : 'Rejected'}`,
            message: approved
                ? `Congratulations! Your ${application.role} application has been approved.`
                : `Your ${application.role} application has been reviewed. ${notes || ''}`,
            read: false,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            status: newStatus,
        };
    }
    catch (error) {
        console.error('Error reviewing application:', error);
        throw new functions.https.HttpsError('internal', 'Failed to review application');
    }
});
function getApprovalTime(role) {
    const times = {
        MEMBER: 'instant',
        DEVELOPER: '2-5 business days',
        ADMIN: '5-10 business days',
        TRUSTED: '3-7 business days',
    };
    return times[role] || '3-5 business days';
}
//# sourceMappingURL=membershipManager.js.map