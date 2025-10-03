export interface NotificationData {
    title: string;
    body: string;
    type: string;
    data?: any;
    priority?: 'normal' | 'high';
    sound?: string;
    icon?: string;
}
export declare function sendNotification(userId: string, notificationData: NotificationData): Promise<void>;
export declare function sendBroadcastNotification(notificationData: NotificationData, userFilter?: (userData: any) => boolean): Promise<void>;
export declare function markNotificationAsRead(userId: string, notificationId: string): Promise<void>;
export declare function getUnreadNotificationCount(userId: string): Promise<number>;
//# sourceMappingURL=notifications.d.ts.map