import { PrismaClient } from '@prisma/client';

// Global database client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper functions for database operations

export class DatabaseHelper {

  // User operations
  static async createUser(address: string, email?: string) {
    return await prisma.user.create({
      data: {
        address: address.toLowerCase(),
        email: email?.toLowerCase()
      }
    });
  }

  static async getUserByAddress(address: string) {
    return await prisma.user.findUnique({
      where: { address: address.toLowerCase() }
    });
  }

  // System configuration operations
  static async getConfig(key: string) {
    const config = await prisma.systemConfig.findUnique({
      where: { key }
    });
    return config?.value;
  }

  static async setConfig(key: string, value: string, updatedBy: string, description?: string) {
    return await prisma.systemConfig.upsert({
      where: { key },
      update: { value, updatedBy, description },
      create: { key, value, updatedBy, description }
    });
  }

  // Reserve operations
  static async getLatestReserveSnapshot() {
    return await prisma.reserveSnapshot.findFirst({
      orderBy: { timestamp: 'desc' }
    });
  }

  static async createReserveSnapshot(data: {
    totalUsdReserve: string;
    totalSupply: string;
    bscSupply: string;
    polygonSupply: string;
    stripeBalance: string;
    cashAppBalance: string;
    bankBalance: string;
    collateralRatio: string;
    blockNumber: number;
  }) {
    return await prisma.reserveSnapshot.create({
      data: {
        ...data,
        isHealthy: parseFloat(data.collateralRatio) >= 1.0
      }
    });
  }

  // Audit logging
  static async createAuditLog(data: {
    action: string;
    entityType: string;
    entityId: string;
    userAddress?: string;
    adminAddress?: string;
    ipAddress?: string;
    userAgent?: string;
    oldData?: any;
    newData?: any;
    metadata?: any;
  }) {
    return await prisma.auditLog.create({
      data: {
        action: data.action as any, // Cast to enum
        entityType: data.entityType,
        entityId: data.entityId,
        userAddress: data.userAddress?.toLowerCase(),
        adminAddress: data.adminAddress?.toLowerCase(),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        oldData: data.oldData,
        newData: data.newData,
        metadata: data.metadata
      }
    });
  }

  // Database health check
  static async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy' };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Graceful shutdown
  static async disconnect() {
    await prisma.$disconnect();
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  await DatabaseHelper.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await DatabaseHelper.disconnect();
  process.exit(0);
});