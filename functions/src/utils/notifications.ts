import * as admin from 'firebase-admin';
import { getFirestoreInstance } from '../config/firebase';

const firestore = getFirestoreInstance();

export interface NotificationData {
  title: string;
  body: string;
  type: string;
  data?: any;
  priority?: 'normal' | 'high';
  sound?: string;
  icon?: string;
}

export async function sendNotification(userId: string, notificationData: NotificationData): Promise<void> {
  try {
    // Save notification to Firestore
    const notification = {
      userId,
      title: notificationData.title,
      body: notificationData.body,
      type: notificationData.type,
      data: notificationData.data || {},
      priority: notificationData.priority || 'normal',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await firestore.collection('notifications').add(notification);

    // Get user's FCM tokens if they have any
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const fcmTokens = userData?.fcmTokens || [];

      if (fcmTokens.length > 0) {
        // Send push notification
        const message = {
          notification: {
            title: notificationData.title,
            body: notificationData.body,
            icon: notificationData.icon || '/icons/c12usd-icon-192.png'
          },
          data: {
            type: notificationData.type,
            ...notificationData.data
          },
          android: {
            priority: notificationData.priority === 'high' ? 'high' : 'normal',
            notification: {
              sound: notificationData.sound || 'default',
              clickAction: 'FLUTTER_NOTIFICATION_CLICK'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: notificationData.sound || 'default',
                badge: 1
              }
            }
          },
          tokens: fcmTokens
        };

        const response = await admin.messaging().sendMulticast(message);

        // Handle failed tokens
        if (response.failureCount > 0) {
          const failedTokens: string[] = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(fcmTokens[idx]);
            }
          });

          // Remove invalid tokens
          if (failedTokens.length > 0) {
            const validTokens = fcmTokens.filter(token => !failedTokens.includes(token));
            await firestore.collection('users').doc(userId).update({
              fcmTokens: validTokens
            });
          }
        }
      }
    }

    console.log(`Notification sent to user ${userId}: ${notificationData.title}`);

  } catch (error) {
    console.error('Error sending notification:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

export async function sendBroadcastNotification(
  notificationData: NotificationData,
  userFilter?: (userData: any) => boolean
): Promise<void> {
  try {
    const usersQuery = await firestore.collection('users').get();
    const notifications: any[] = [];
    const fcmTokens: string[] = [];

    for (const userDoc of usersQuery.docs) {
      const userData = userDoc.data();

      // Apply filter if provided
      if (userFilter && !userFilter(userData)) {
        continue;
      }

      // Add to notifications collection
      notifications.push({
        userId: userDoc.id,
        title: notificationData.title,
        body: notificationData.body,
        type: notificationData.type,
        data: notificationData.data || {},
        priority: notificationData.priority || 'normal',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Collect FCM tokens
      if (userData.fcmTokens) {
        fcmTokens.push(...userData.fcmTokens);
      }
    }

    // Batch write notifications
    if (notifications.length > 0) {
      const batchSize = 500; // Firestore batch limit
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = firestore.batch();
        const batchNotifications = notifications.slice(i, i + batchSize);

        batchNotifications.forEach(notification => {
          const docRef = firestore.collection('notifications').doc();
          batch.set(docRef, notification);
        });

        await batch.commit();
      }
    }

    // Send push notifications
    if (fcmTokens.length > 0) {
      const message = {
        notification: {
          title: notificationData.title,
          body: notificationData.body,
          icon: notificationData.icon || '/icons/c12usd-icon-192.png'
        },
        data: {
          type: notificationData.type,
          ...notificationData.data
        }
      };

      // Send in batches of 500 (FCM limit)
      const tokenBatchSize = 500;
      for (let i = 0; i < fcmTokens.length; i += tokenBatchSize) {
        const tokenBatch = fcmTokens.slice(i, i + tokenBatchSize);
        await admin.messaging().sendMulticast({
          ...message,
          tokens: tokenBatch
        });
      }
    }

    console.log(`Broadcast notification sent to ${notifications.length} users: ${notificationData.title}`);

  } catch (error) {
    console.error('Error sending broadcast notification:', error);
  }
}

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  try {
    const notificationDoc = await firestore.collection('notifications').doc(notificationId).get();

    if (notificationDoc.exists && notificationDoc.data()?.userId === userId) {
      await notificationDoc.ref.update({
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const unreadQuery = await firestore
      .collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    return unreadQuery.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}