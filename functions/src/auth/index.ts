import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestoreInstance } from '../config/firebase';
import { createAuditLog } from '../utils/audit';
import { validateEthereumAddress } from '../utils/crypto';
import { checkRateLimit } from '../utils/rateLimit';

const firestore = getFirestoreInstance();
const auth = getAuth();

// Custom token creation for wallet-based authentication
export const createCustomToken = functions.https.onCall(async (data, context) => {
  try {
    const { address, signature, message } = data;

    // Validate input
    if (!address || !signature || !message) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: address, signature, message'
      );
    }

    // Validate Ethereum address format
    if (!validateEthereumAddress(address)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid Ethereum address format'
      );
    }

    // Rate limiting
    await checkRateLimit('LOGIN_ATTEMPTS', address, 10, 3600); // 10 per hour

    // Verify signature (implement your signature verification logic)
    // This would typically involve verifying the signature against the message

    // Check if user exists in our database
    const userDoc = await firestore.collection('users').where('address', '==', address).get();

    let userId: string;
    let userData: any = {};

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
    } else {
      // Update existing user
      const existingUser = userDoc.docs[0];
      userId = existingUser.id;
      userData = existingUser.data();

      // Check if user is blacklisted or suspended
      if (userData.isBlacklisted) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Account is blacklisted'
        );
      }

      if (userData.status === 'SUSPENDED' || userData.status === 'BANNED') {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Account is suspended or banned'
        );
      }

      // Update last login
      await firestore.collection('users').doc(userId).update({
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Create custom claims
    const customClaims: any = {
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
      ipAddress: context.rawRequest?.ip || 'unknown',
      userAgent: context.rawRequest?.headers['user-agent'] || 'unknown',
      isActive: true,
      lastActivity: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Audit log
    await createAuditLog({
      action: 'LOGIN',
      entityType: 'user',
      entityId: userId,
      userAddress: address.toLowerCase(),
      ipAddress: context.rawRequest?.ip || 'unknown',
      userAgent: context.rawRequest?.headers['user-agent'] || 'unknown',
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

  } catch (error) {
    console.error('Error creating custom token:', error);

    // Audit security event
    await createAuditLog({
      action: 'SECURITY_EVENT',
      entityType: 'auth',
      entityId: 'login_failure',
      userAddress: data.address?.toLowerCase(),
      ipAddress: context.rawRequest?.ip || 'unknown',
      securityFlags: { flags: ['failed_login'] },
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      severity: 'WARN',
      category: 'SECURITY'
    });

    throw error;
  }
});

// Logout function to invalidate sessions
export const logout = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
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
    } else {
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
    await createAuditLog({
      action: 'LOGOUT',
      entityType: 'user',
      entityId: userId,
      userAddress: context.auth.token.address,
      ipAddress: context.rawRequest?.ip || 'unknown',
      metadata: { sessionToken: sessionToken || 'all_sessions' },
      severity: 'INFO',
      category: 'USER_ACTION'
    });

    return { success: true };

  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
});

// Update user profile
export const updateProfile = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const userId = context.auth.uid;
    const { firstName, lastName, email, phoneNumber } = data;

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid email format'
      );
    }

    // Check if email already exists
    if (email) {
      const emailQuery = await firestore
        .collection('users')
        .where('email', '==', email)
        .get();

      if (!emailQuery.empty && emailQuery.docs[0].id !== userId) {
        throw new functions.https.HttpsError(
          'already-exists',
          'Email address already in use'
        );
      }
    }

    // Get current user data
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User not found'
      );
    }

    const oldData = userDoc.data();

    // Update user profile
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

    await firestore.collection('users').doc(userId).update(updateData);

    // Audit log
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'user',
      entityId: userId,
      userAddress: context.auth.token.address,
      ipAddress: context.rawRequest?.ip || 'unknown',
      oldData: {
        firstName: oldData?.firstName,
        lastName: oldData?.lastName,
        email: oldData?.email,
        phoneNumber: oldData?.phoneNumber
      },
      newData: updateData,
      severity: 'INFO',
      category: 'USER_ACTION'
    });

    return { success: true };

  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
});

// Session validation
export const validateSession = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { sessionToken } = data;
    const userId = context.auth.uid;

    if (!sessionToken) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Session token required'
      );
    }

    // Find and validate session
    const sessionQuery = await firestore
      .collection('user_sessions')
      .where('userId', '==', userId)
      .where('sessionToken', '==', sessionToken)
      .where('isActive', '==', true)
      .get();

    if (sessionQuery.empty) {
      throw new functions.https.HttpsError(
        'not-found',
        'Invalid or expired session'
      );
    }

    const session = sessionQuery.docs[0].data();

    // Check if session is expired
    if (session.expiresAt.toDate() < new Date()) {
      // Mark session as inactive
      await sessionQuery.docs[0].ref.update({
        isActive: false,
        expiredAt: admin.firestore.FieldValue.serverTimestamp()
      });

      throw new functions.https.HttpsError(
        'permission-denied',
        'Session has expired'
      );
    }

    // Update last activity
    await sessionQuery.docs[0].ref.update({
      lastActivity: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: context.rawRequest?.ip || session.ipAddress
    });

    return {
      valid: true,
      expiresAt: session.expiresAt,
      lastActivity: session.lastActivity
    };

  } catch (error) {
    console.error('Error validating session:', error);
    throw error;
  }
});

export const authFunctions = {
  createCustomToken,
  logout,
  updateProfile,
  validateSession
};