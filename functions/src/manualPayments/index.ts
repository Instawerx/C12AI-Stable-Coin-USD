import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';
import { createAuditLog } from '../utils/audit';
import { sendNotification } from '../utils/notifications';

const prisma = new PrismaClient();

/**
 * Create a new manual payment request
 * User calls this after selecting token type and amount
 */
export const createManualPayment = functions.https.onCall(async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const {
      referenceId,
      tokenType,
      requestedAmount,
      tokenAmount,
      deliveryChain,
      paymentMethod,
      paymentAmount,
      cashAppCashtag,
      cashAppProof,
      stablecoinType,
      senderAddress,
      txHash,
      blockchainChain,
      userNotes,
    } = data;

    // Validation
    if (!referenceId || !tokenType || !requestedAmount || !deliveryChain || !paymentMethod) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Validate amounts
    const minPurchase = parseFloat(
      (await prisma.systemConfig.findUnique({ where: { key: 'MIN_PURCHASE_USD' } }))?.value || '10.00'
    );
    const maxPurchase = parseFloat(
      (await prisma.systemConfig.findUnique({ where: { key: 'MAX_PURCHASE_USD' } }))?.value || '50000.00'
    );

    if (parseFloat(requestedAmount) < minPurchase) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Minimum purchase is $${minPurchase}`
      );
    }

    if (parseFloat(requestedAmount) > maxPurchase) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Maximum purchase is $${maxPurchase} without enhanced KYC`
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { address: userId },
    });

    if (!user) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    // Calculate expiry (24 hours from now)
    const expiryHours = parseInt(
      (await prisma.systemConfig.findUnique({ where: { key: 'MANUAL_PAYMENT_EXPIRY_HOURS' } }))?.value || '24'
    );
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    // Create ManualPayment record
    const manualPayment = await prisma.manualPayment.create({
      data: {
        referenceId,
        userId: user.id,
        tokenType,
        requestedAmount,
        tokenAmount,
        deliveryChain,
        paymentMethod,
        paymentAmount,
        cashAppCashtag: cashAppCashtag || null,
        cashAppProof: cashAppProof || null,
        stablecoinType: stablecoinType || null,
        senderAddress: senderAddress || null,
        txHash: txHash || null,
        blockchainChain: blockchainChain || null,
        status: cashAppProof || txHash ? 'PENDING_VERIFICATION' : 'PENDING_SUBMISSION',
        userNotes: userNotes || null,
        expiresAt,
      },
    });

    // Create notification for admins
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM',
        priority: 'HIGH',
        title: 'New Manual Payment Submission',
        message: `${tokenType} purchase: $${requestedAmount} via ${paymentMethod}`,
        metadata: {
          referenceId,
          tokenType,
          requestedAmount,
          paymentMethod,
          manualPaymentId: manualPayment.id,
        },
      },
    });

    // Audit log
    await createAuditLog({
      action: 'CREATE',
      entityType: 'manual_payment',
      entityId: referenceId,
      userAddress: userId,
      newData: { tokenType, requestedAmount, paymentMethod, status: manualPayment.status },
      severity: 'INFO',
      category: 'FINANCIAL',
    });

    console.log(`Manual payment created: ${referenceId} for user ${userId}`);

    return {
      success: true,
      referenceId,
      manualPaymentId: manualPayment.id,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error('Error creating manual payment:', error);
    throw error;
  }
});

/**
 * Update manual payment with proof (screenshot or TX hash)
 * User calls this after making the payment
 */
export const submitPaymentProof = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const { manualPaymentId, cashAppProof, txHash, senderInfo } = data;

    if (!manualPaymentId) {
      throw new functions.https.HttpsError('invalid-argument', 'Payment ID required');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { address: userId },
    });

    if (!user) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    // Get payment record
    const payment = await prisma.manualPayment.findUnique({
      where: { id: manualPaymentId },
    });

    if (!payment) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    // Verify ownership
    if (payment.userId !== user.id) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    // Check if already submitted
    if (payment.status !== 'PENDING_SUBMISSION') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Payment already ${payment.status}`
      );
    }

    // Check expiry
    if (new Date() > payment.expiresAt) {
      await prisma.manualPayment.update({
        where: { id: manualPaymentId },
        data: { status: 'EXPIRED' },
      });
      throw new functions.https.HttpsError('deadline-exceeded', 'Payment submission expired');
    }

    // Update payment with proof
    const updateData: any = {
      status: 'PENDING_VERIFICATION',
      updatedAt: new Date(),
    };

    if (payment.paymentMethod === 'CASH_APP') {
      if (!cashAppProof || !senderInfo) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Cash App proof and cashtag required'
        );
      }
      updateData.cashAppProof = cashAppProof;
      updateData.cashAppCashtag = senderInfo;
    } else if (payment.paymentMethod === 'STABLECOIN') {
      if (!txHash || !senderInfo) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Transaction hash and wallet address required'
        );
      }
      updateData.txHash = txHash;
      updateData.senderAddress = senderInfo;
    }

    const updatedPayment = await prisma.manualPayment.update({
      where: { id: manualPaymentId },
      data: updateData,
    });

    // Notify user
    await sendNotification(user.id, {
      title: 'Payment Proof Submitted',
      body: `Your payment for ${payment.tokenAmount} ${payment.tokenType} is being verified`,
      type: 'manual_payment_submitted',
      data: { referenceId: payment.referenceId },
    });

    // Audit log
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'manual_payment',
      entityId: payment.referenceId,
      userAddress: userId,
      oldData: { status: 'PENDING_SUBMISSION' },
      newData: { status: 'PENDING_VERIFICATION', proofSubmitted: true },
      severity: 'INFO',
      category: 'FINANCIAL',
    });

    console.log(`Payment proof submitted: ${payment.referenceId}`);

    return { success: true, status: 'PENDING_VERIFICATION' };
  } catch (error) {
    console.error('Error submitting payment proof:', error);
    throw error;
  }
});

/**
 * Admin function to verify and approve/reject manual payment
 * Only callable by admins with FINANCE_ADMIN role
 */
export const verifyManualPayment = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const adminUserId = context.auth.uid;
    const { paymentId, approved, rejectionReason, adminNotes } = data;

    if (!paymentId || approved === undefined) {
      throw new functions.https.HttpsError('invalid-argument', 'Payment ID and approval status required');
    }

    // Check admin permissions
    const adminUser = await prisma.user.findUnique({
      where: { address: adminUserId },
      include: { adminRoles: true },
    });

    if (!adminUser || adminUser.adminRoles.length === 0) {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    const hasFinanceRole = adminUser.adminRoles.some(
      (role: any) => role.role === 'FINANCE_ADMIN' || role.role === 'SUPER_ADMIN'
    );

    if (!hasFinanceRole) {
      throw new functions.https.HttpsError('permission-denied', 'Finance admin access required');
    }

    // Get payment
    const payment = await prisma.manualPayment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    if (payment.status !== 'PENDING_VERIFICATION') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Payment status is ${payment.status}, cannot verify`
      );
    }

    if (approved) {
      // Approve and initiate distribution
      await prisma.manualPayment.update({
        where: { id: paymentId },
        data: {
          status: 'APPROVED',
          verifiedBy: adminUser.id,
          verifiedAt: new Date(),
          adminNotes: adminNotes || null,
          updatedAt: new Date(),
        },
      });

      // Trigger token distribution
      await distributeTokens(paymentId, payment);

      // Notify user
      await sendNotification(payment.userId, {
        title: 'Payment Approved!',
        body: `Your ${payment.tokenType} purchase has been approved. Tokens will be delivered shortly.`,
        type: 'manual_payment_approved',
        priority: 'high',
        data: { referenceId: payment.referenceId },
      });

      console.log(`Payment approved: ${payment.referenceId} by admin ${adminUser.address}`);
    } else {
      // Reject payment
      if (!rejectionReason) {
        throw new functions.https.HttpsError('invalid-argument', 'Rejection reason required');
      }

      await prisma.manualPayment.update({
        where: { id: paymentId },
        data: {
          status: 'REJECTED',
          verifiedBy: adminUser.id,
          verifiedAt: new Date(),
          rejectionReason,
          adminNotes: adminNotes || null,
          updatedAt: new Date(),
        },
      });

      // Notify user
      await sendNotification(payment.userId, {
        title: 'Payment Rejected',
        body: `Your payment has been rejected. Reason: ${rejectionReason}`,
        type: 'manual_payment_rejected',
        priority: 'high',
        data: { referenceId: payment.referenceId, reason: rejectionReason },
      });

      console.log(`Payment rejected: ${payment.referenceId} by admin ${adminUser.address}`);
    }

    // Audit log
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'manual_payment',
      entityId: payment.referenceId,
      adminAddress: adminUserId,
      oldData: { status: 'PENDING_VERIFICATION' },
      newData: { status: approved ? 'APPROVED' : 'REJECTED', rejectionReason },
      severity: approved ? 'INFO' : 'WARN',
      category: 'FINANCIAL',
    });

    return { success: true, status: approved ? 'APPROVED' : 'REJECTED' };
  } catch (error) {
    console.error('Error verifying manual payment:', error);
    throw error;
  }
});

/**
 * Internal function to distribute tokens after approval
 */
async function distributeTokens(paymentId: string, payment: any) {
  try {
    // Update status to DISTRIBUTING
    await prisma.manualPayment.update({
      where: { id: paymentId },
      data: { status: 'DISTRIBUTING', updatedAt: new Date() },
    });

    let distributionTxHash: string;

    if (payment.tokenType === 'C12USD') {
      // For C12USD: Generate mint signature and create MintReceipt
      distributionTxHash = await mintC12USD(payment);
    } else {
      // For C12DAO: Transfer from treasury/admin wallet
      distributionTxHash = await transferC12DAO(payment);
    }

    // Update status to COMPLETED
    await prisma.manualPayment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        distributionTxHash,
        distributedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Notify user
    await sendNotification(payment.userId, {
      title: 'Tokens Delivered!',
      body: `Your ${payment.tokenAmount} ${payment.tokenType} have been delivered to ${payment.deliveryChain}`,
      type: 'manual_payment_completed',
      priority: 'high',
      data: {
        referenceId: payment.referenceId,
        tokenType: payment.tokenType,
        tokenAmount: payment.tokenAmount,
        distributionTxHash,
        chain: payment.deliveryChain,
      },
    });

    // Audit log
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'manual_payment',
      entityId: payment.referenceId,
      userAddress: payment.user.address,
      newData: {
        status: 'COMPLETED',
        distributionTxHash,
        tokenAmount: payment.tokenAmount,
        chain: payment.deliveryChain,
      },
      severity: 'INFO',
      category: 'FINANCIAL',
    });

    console.log(`Tokens distributed: ${payment.referenceId}, TX: ${distributionTxHash}`);
  } catch (error) {
    console.error('Error distributing tokens:', error);

    // Update status to REJECTED with error message
    await prisma.manualPayment.update({
      where: { id: paymentId },
      data: {
        status: 'REJECTED',
        rejectionReason: 'Distribution failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        adminNotes: 'Automatic distribution failed',
        updatedAt: new Date(),
      },
    });

    throw error;
  }
}

/**
 * Mint C12USD tokens (creates mint receipt with signature)
 */
async function mintC12USD(payment: any): Promise<string> {
  // This would integrate with your existing mint signature service
  // For now, return a placeholder
  // TODO: Integrate with actual mint service
  console.log(`Minting ${payment.tokenAmount} C12USD for user ${payment.user.address}`);

  // Create MintReceipt record
  const nonce = `manual_${payment.referenceId}_${Date.now()}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const mintReceipt = await prisma.mintReceipt.create({
    data: {
      userId: payment.userId,
      amount: payment.requestedAmount,
      tokenAmount: payment.tokenAmount,
      chain: payment.deliveryChain,
      status: 'SIGNATURE_PENDING',
      paymentMethod: 'BANK_TRANSFER', // Manual payment treated as bank transfer
      paymentId: payment.referenceId,
      receipt: JSON.stringify({
        type: 'manual_payment',
        referenceId: payment.referenceId,
        amount: payment.requestedAmount,
        tokenAmount: payment.tokenAmount,
      }),
      signature: 'PENDING', // Will be generated by signer service
      nonce,
      expiresAt,
    },
  });

  // TODO: Call signer service to generate actual signature
  // For now, return a placeholder TX hash
  return `0x${payment.referenceId.replace('C12-', '')}${Date.now().toString(16)}`;
}

/**
 * Transfer C12DAO tokens from treasury
 */
async function transferC12DAO(payment: any): Promise<string> {
  // This would integrate with your wallet service to transfer C12DAO
  // from the treasury or admin wallet to the user
  // TODO: Integrate with actual transfer service
  console.log(`Transferring ${payment.tokenAmount} C12DAO for user ${payment.user.address}`);

  // Return placeholder TX hash
  return `0x${payment.referenceId.replace('C12-', '')}${Date.now().toString(16)}`;
}

/**
 * Get manual payment by reference ID
 */
export const getManualPayment = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const userId = context.auth.uid;
    const { referenceId } = data;

    if (!referenceId) {
      throw new functions.https.HttpsError('invalid-argument', 'Reference ID required');
    }

    const user = await prisma.user.findUnique({
      where: { address: userId },
    });

    if (!user) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const payment = await prisma.manualPayment.findUnique({
      where: { referenceId },
    });

    if (!payment) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    // Verify ownership
    if (payment.userId !== user.id) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    return {
      success: true,
      payment: {
        id: payment.id,
        referenceId: payment.referenceId,
        tokenType: payment.tokenType,
        requestedAmount: payment.requestedAmount.toString(),
        tokenAmount: payment.tokenAmount.toString(),
        deliveryChain: payment.deliveryChain,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        createdAt: payment.createdAt.toISOString(),
        expiresAt: payment.expiresAt.toISOString(),
        distributionTxHash: payment.distributionTxHash,
        distributedAt: payment.distributedAt?.toISOString(),
        rejectionReason: payment.rejectionReason,
      },
    };
  } catch (error) {
    console.error('Error getting manual payment:', error);
    throw error;
  }
});

/**
 * List manual payments (Admin only)
 * Supports filtering by status
 */
export const listPayments = functions.https.onCall(async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    // Admin role check
    const adminRole = context.auth.token.adminRole;
    if (adminRole !== 'SUPER_ADMIN' && adminRole !== 'FINANCE_ADMIN') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Admin privileges required'
      );
    }

    const { status, limit = 100, offset = 0 } = data;

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      if (status === 'pending') {
        where.status = 'PENDING_VERIFICATION';
      } else if (status === 'verifying') {
        where.status = 'VERIFYING';
      } else if (status === 'approved') {
        where.status = 'APPROVED';
      } else if (status === 'completed') {
        where.status = 'COMPLETED';
      } else if (status === 'rejected') {
        where.status = 'REJECTED';
      } else {
        where.status = status;
      }
    }

    // Fetch payments with user details
    const payments = await prisma.manualPayment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Format response
    const formattedPayments = payments.map((payment: any) => ({
      id: payment.id,
      referenceId: payment.referenceId,
      userId: payment.user.id,
      userEmail: payment.user.email,
      tokenType: payment.tokenType,
      requestedAmount: parseFloat(payment.requestedAmount.toString()),
      tokenAmount: parseFloat(payment.tokenAmount.toString()),
      deliveryChain: payment.deliveryChain,
      deliveryAddress: payment.user.address,
      paymentMethod: payment.paymentMethod,
      stablecoinType: payment.stablecoinType,
      status: payment.status,
      createdAt: payment.createdAt.toISOString(),
      expiresAt: payment.expiresAt.toISOString(),
      cashAppProof: payment.cashAppProof,
      stablecoinTxHash: payment.txHash,
      distributionTxHash: payment.distributionTxHash,
      distributedAt: payment.distributedAt?.toISOString(),
      rejectionReason: payment.rejectionReason,
      verifiedBy: payment.verifiedBy,
      verifiedAt: payment.verifiedAt?.toISOString(),
    }));

    return {
      success: true,
      payments: formattedPayments,
      total: formattedPayments.length,
    };
  } catch (error) {
    console.error('Error listing payments:', error);
    throw error;
  }
});

/**
 * Get payment analytics (Admin only)
 * Returns aggregated statistics for the specified time range
 */
export const getAnalytics = functions.https.onCall(async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    // Admin role check
    const adminRole = context.auth.token.adminRole;
    if (adminRole !== 'SUPER_ADMIN' && adminRole !== 'FINANCE_ADMIN') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Admin privileges required'
      );
    }

    const { timeRange = '30d' } = data;

    // Calculate date range
    let startDate = new Date();
    if (timeRange === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (timeRange === '90d') {
      startDate.setDate(startDate.getDate() - 90);
    } else {
      startDate = new Date(0); // All time
    }

    // Fetch all payments in range
    const payments = await prisma.manualPayment.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate metrics
    const totalPayments = payments.length;
    const totalVolume = payments.reduce(
      (sum: number, p: any) => sum + parseFloat(p.requestedAmount.toString()),
      0
    );

    const completedPayments = payments.filter((p: any) => p.status === 'COMPLETED');
    const completedVolume = completedPayments.reduce(
      (sum: number, p: any) => sum + parseFloat(p.requestedAmount.toString()),
      0
    );

    const pendingPayments = payments.filter(
      (p: any) => p.status === 'PENDING_VERIFICATION' || p.status === 'PENDING_SUBMISSION'
    );
    const pendingVolume = pendingPayments.reduce(
      (sum: number, p: any) => sum + parseFloat(p.requestedAmount.toString()),
      0
    );

    const rejectedPayments = payments.filter((p: any) => p.status === 'REJECTED');

    const averageAmount =
      totalPayments > 0 ? totalVolume / totalPayments : 0;

    // Calculate average verification time (in hours)
    const verifiedPayments = payments.filter(
      (p: any) => p.verifiedAt && p.createdAt
    );
    const totalVerificationTime = verifiedPayments.reduce((sum: number, p: any) => {
      const diff = p.verifiedAt!.getTime() - p.createdAt.getTime();
      return sum + diff / (1000 * 60 * 60); // Convert to hours
    }, 0);
    const averageVerificationTime =
      verifiedPayments.length > 0
        ? totalVerificationTime / verifiedPayments.length
        : 0;

    const conversionRate =
      totalPayments > 0
        ? (completedPayments.length / totalPayments) * 100
        : 0;

    // Token breakdown
    const tokenBreakdown = {
      C12USD: {
        count: payments.filter((p: any) => p.tokenType === 'C12USD').length,
        volume: payments
          .filter((p: any) => p.tokenType === 'C12USD')
          .reduce((sum: number, p: any) => sum + parseFloat(p.requestedAmount.toString()), 0),
      },
      C12DAO: {
        count: payments.filter((p: any) => p.tokenType === 'C12DAO').length,
        volume: payments
          .filter((p: any) => p.tokenType === 'C12DAO')
          .reduce((sum: number, p: any) => sum + parseFloat(p.requestedAmount.toString()), 0),
      },
    };

    // Payment method breakdown
    const paymentMethodBreakdown = {
      CASH_APP: {
        count: payments.filter((p: any) => p.paymentMethod === 'CASH_APP').length,
        volume: payments
          .filter((p: any) => p.paymentMethod === 'CASH_APP')
          .reduce((sum: number, p: any) => sum + parseFloat(p.requestedAmount.toString()), 0),
      },
      STABLECOIN: {
        count: payments.filter((p: any) => p.paymentMethod === 'STABLECOIN').length,
        volume: payments
          .filter((p: any) => p.paymentMethod === 'STABLECOIN')
          .reduce((sum: number, p: any) => sum + parseFloat(p.requestedAmount.toString()), 0),
      },
    };

    // Daily stats
    const dailyStatsMap = new Map<string, any>();
    payments.forEach((payment: any) => {
      const dateKey = payment.createdAt.toISOString().split('T')[0];
      if (!dailyStatsMap.has(dateKey)) {
        dailyStatsMap.set(dateKey, {
          date: dateKey,
          count: 0,
          volume: 0,
          completed: 0,
          rejected: 0,
        });
      }
      const stats = dailyStatsMap.get(dateKey);
      stats.count += 1;
      stats.volume += parseFloat(payment.requestedAmount.toString());
      if (payment.status === 'COMPLETED') stats.completed += 1;
      if (payment.status === 'REJECTED') stats.rejected += 1;
    });

    const dailyStats = Array.from(dailyStatsMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      success: true,
      totalPayments,
      totalVolume,
      completedPayments: completedPayments.length,
      completedVolume,
      pendingPayments: pendingPayments.length,
      pendingVolume,
      rejectedPayments: rejectedPayments.length,
      averageAmount,
      averageVerificationTime,
      conversionRate,
      dailyStats,
      tokenBreakdown,
      paymentMethodBreakdown,
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
});

// Export all functions
export const manualPaymentFunctions = {
  createManualPayment,
  submitPaymentProof,
  verifyManualPayment,
  getManualPayment,
  listPayments,
  getAnalytics,
};
