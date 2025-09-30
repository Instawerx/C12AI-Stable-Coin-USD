import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { getFirestoreInstance } from '../config/firebase';

const firestore = getFirestoreInstance();

export async function checkRateLimit(
  type: 'API_REQUESTS' | 'MINT_OPERATIONS' | 'REDEEM_OPERATIONS' | 'LOGIN_ATTEMPTS' | 'FAILED_TRANSACTIONS',
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<void> {
  const windowStart = new Date();
  windowStart.setSeconds(windowStart.getSeconds() - windowSeconds);
  const windowEnd = new Date();

  // Check existing rate limit record
  const rateLimitQuery = await firestore
    .collection('rate_limits')
    .where('identifier', '==', identifier)
    .where('type', '==', type)
    .where('windowStart', '>=', windowStart)
    .orderBy('windowStart', 'desc')
    .limit(1)
    .get();

  let rateLimitDoc;
  let currentCount = 0;

  if (!rateLimitQuery.empty) {
    rateLimitDoc = rateLimitQuery.docs[0];
    const data = rateLimitDoc.data();

    // Check if user is currently blocked
    if (data.isBlocked && data.blockedUntil && data.blockedUntil.toDate() > new Date()) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        `Rate limit exceeded. Try again after ${data.blockedUntil.toDate().toISOString()}`
      );
    }

    // If window is still active, increment count
    if (data.windowEnd.toDate() > new Date()) {
      currentCount = data.requestCount;
    }
  }

  // Check if limit would be exceeded
  if (currentCount >= limit) {
    // Block user for the remaining window time + additional penalty
    const blockedUntil = new Date(windowEnd.getTime() + windowSeconds * 1000);

    if (rateLimitDoc) {
      await rateLimitDoc.ref.update({
        isBlocked: true,
        blockedUntil,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    throw new functions.https.HttpsError(
      'resource-exhausted',
      `Rate limit exceeded for ${type}. Try again after ${blockedUntil.toISOString()}`
    );
  }

  // Update or create rate limit record
  if (rateLimitDoc && rateLimitDoc.data().windowEnd.toDate() > new Date()) {
    // Update existing window
    await rateLimitDoc.ref.update({
      requestCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } else {
    // Create new window
    await firestore.collection('rate_limits').add({
      identifier,
      type,
      windowStart: windowEnd,
      windowEnd: new Date(windowEnd.getTime() + windowSeconds * 1000),
      requestCount: 1,
      limit,
      isBlocked: false,
      blockedUntil: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

export async function resetRateLimit(identifier: string, type: string): Promise<void> {
  const rateLimitQuery = await firestore
    .collection('rate_limits')
    .where('identifier', '==', identifier)
    .where('type', '==', type)
    .get();

  const batch = firestore.batch();
  for (const doc of rateLimitQuery.docs) {
    batch.update(doc.ref, {
      isBlocked: false,
      blockedUntil: null,
      requestCount: 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  await batch.commit();
}