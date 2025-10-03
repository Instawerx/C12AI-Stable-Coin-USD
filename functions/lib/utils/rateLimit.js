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
exports.checkRateLimit = checkRateLimit;
exports.resetRateLimit = resetRateLimit;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("../config/firebase");
const firestore = (0, firebase_1.getFirestoreInstance)();
async function checkRateLimit(type, identifier, limit, windowSeconds) {
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
            throw new functions.https.HttpsError('resource-exhausted', `Rate limit exceeded. Try again after ${data.blockedUntil.toDate().toISOString()}`);
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
        throw new functions.https.HttpsError('resource-exhausted', `Rate limit exceeded for ${type}. Try again after ${blockedUntil.toISOString()}`);
    }
    // Update or create rate limit record
    if (rateLimitDoc && rateLimitDoc.data().windowEnd.toDate() > new Date()) {
        // Update existing window
        await rateLimitDoc.ref.update({
            requestCount: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    else {
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
async function resetRateLimit(identifier, type) {
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
//# sourceMappingURL=rateLimit.js.map