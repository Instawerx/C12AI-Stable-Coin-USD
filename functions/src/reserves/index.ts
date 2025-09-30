import * as functions from 'firebase-functions';
import { getFirestoreInstance } from '../config/firebase';

const firestore = getFirestoreInstance();

export const getReserveStatus = functions.https.onCall(async (data, context) => {
  try {
    // Get latest reserve snapshot
    const latestSnapshot = await firestore
      .collection('reserve_snapshots')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (latestSnapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'No reserve data available');
    }

    const reserveData = latestSnapshot.docs[0].data();

    return {
      totalUsdReserve: reserveData.totalUsdReserve,
      totalSupply: reserveData.totalSupply,
      collateralRatio: reserveData.collateralRatio,
      isHealthy: reserveData.isHealthy,
      healthScore: reserveData.healthScore,
      lastUpdate: reserveData.timestamp,
      attestationUrl: reserveData.attestationUrl
    };

  } catch (error) {
    console.error('Error getting reserve status:', error);
    throw error;
  }
});

export const reserveFunctions = {
  getReserveStatus
};