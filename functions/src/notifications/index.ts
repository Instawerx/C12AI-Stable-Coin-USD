import * as functions from 'firebase-functions';
import { sendNotification, markNotificationAsRead, getUnreadNotificationCount } from '../utils/notifications';

export const sendUserNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { title, body, type, notificationData } = data;

  await sendNotification(context.auth.uid, {
    title,
    body,
    type,
    data: notificationData
  });

  return { success: true };
});

export const markAsRead = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { notificationId } = data;
  await markNotificationAsRead(context.auth.uid, notificationId);

  return { success: true };
});

export const getUnreadCount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const count = await getUnreadNotificationCount(context.auth.uid);
  return { count };
});

export const notificationFunctions = {
  sendUserNotification,
  markAsRead,
  getUnreadCount
};