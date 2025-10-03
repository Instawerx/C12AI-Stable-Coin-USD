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
exports.sendNotification = sendNotification;
exports.sendBroadcastNotification = sendBroadcastNotification;
exports.markNotificationAsRead = markNotificationAsRead;
exports.getUnreadNotificationCount = getUnreadNotificationCount;
const admin = __importStar(require("firebase-admin"));
const firebase_1 = require("../config/firebase");
const firestore = (0, firebase_1.getFirestoreInstance)();
async function sendNotification(userId, notificationData) {
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
            const fcmTokens = (userData === null || userData === void 0 ? void 0 : userData.fcmTokens) || [];
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
                        priority: (notificationData.priority === 'high' ? 'high' : 'normal'),
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
                    const failedTokens = [];
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            failedTokens.push(fcmTokens[idx]);
                        }
                    });
                    // Remove invalid tokens
                    if (failedTokens.length > 0) {
                        const validTokens = fcmTokens.filter((token) => !failedTokens.includes(token));
                        await firestore.collection('users').doc(userId).update({
                            fcmTokens: validTokens
                        });
                    }
                }
            }
        }
        console.log(`Notification sent to user ${userId}: ${notificationData.title}`);
    }
    catch (error) {
        console.error('Error sending notification:', error);
        // Don't throw error to avoid breaking the main operation
    }
}
async function sendBroadcastNotification(notificationData, userFilter) {
    try {
        const usersQuery = await firestore.collection('users').get();
        const notifications = [];
        const fcmTokens = [];
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
    }
    catch (error) {
        console.error('Error sending broadcast notification:', error);
    }
}
async function markNotificationAsRead(userId, notificationId) {
    var _a;
    try {
        const notificationDoc = await firestore.collection('notifications').doc(notificationId).get();
        if (notificationDoc.exists && ((_a = notificationDoc.data()) === null || _a === void 0 ? void 0 : _a.userId) === userId) {
            await notificationDoc.ref.update({
                read: true,
                readAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
    }
}
async function getUnreadNotificationCount(userId) {
    try {
        const unreadQuery = await firestore
            .collection('notifications')
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();
        return unreadQuery.size;
    }
    catch (error) {
        console.error('Error getting unread notification count:', error);
        return 0;
    }
}
//# sourceMappingURL=notifications.js.map