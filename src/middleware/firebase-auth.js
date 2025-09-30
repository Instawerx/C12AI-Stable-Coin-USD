const admin = require('firebase-admin');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || 'c12ai-dao'
  });
}

/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID tokens and populates req.user with user data
 */
const authenticateFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing ID token'
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: {
        id: true,
        address: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        kycStatus: true,
        kycTier: true,
        riskScore: true,
        isBlacklisted: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User record not found in database'
      });
    }

    // Check user status
    if (user.isBlacklisted) {
      return res.status(403).json({
        error: 'Account Blacklisted',
        message: 'This account has been restricted'
      });
    }

    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      return res.status(403).json({
        error: 'Account Suspended',
        message: 'This account is currently suspended'
      });
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Populate req.user with combined Firebase and database user data
    req.user = {
      ...user,
      uid: decodedToken.uid,
      address: decodedToken.address || user.address,
      customClaims: decodedToken,
      isAdmin: decodedToken.admin || false,
      roles: decodedToken.roles || []
    };

    next();

  } catch (error) {
    console.error('Authentication error:', error);

    // Handle specific Firebase Auth errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Your session has expired. Please log in again.'
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Token Revoked',
        message: 'Your session has been revoked. Please log in again.'
      });
    }

    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Invalid authentication token'
      });
    }

    return res.status(401).json({
      error: 'Authentication Failed',
      message: 'Failed to authenticate request'
    });
  }
};

/**
 * Admin Authorization Middleware
 * Requires user to be authenticated and have admin privileges
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  if (!req.user.isAdmin && !req.user.roles.includes('admin')) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin privileges required'
    });
  }

  next();
};

/**
 * Role-based Authorization Middleware
 * Requires user to have specific role
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!req.user.roles.includes(requiredRole) && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role '${requiredRole}' required`
      });
    }

    next();
  };
};

/**
 * KYC Requirement Middleware
 * Requires user to have completed KYC verification
 */
const requireKYC = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Check if KYC is required by system config
  const kycConfig = await prisma.systemConfig.findUnique({
    where: { key: 'KYC_REQUIRED' }
  });

  const kycRequired = kycConfig?.value === 'true';

  if (kycRequired && req.user.kycStatus !== 'APPROVED') {
    return res.status(403).json({
      error: 'KYC Required',
      message: 'Identity verification required to perform this action',
      kycStatus: req.user.kycStatus
    });
  }

  next();
};

/**
 * Rate Limiting Middleware for API endpoints
 */
const rateLimit = (type, limit, windowSeconds = 3600) => {
  return async (req, res, next) => {
    try {
      const identifier = req.user?.id || req.ip;
      const windowStart = new Date(Date.now() - windowSeconds * 1000);

      // Check existing rate limit
      const existingLimit = await prisma.rateLimit.findFirst({
        where: {
          identifier,
          type,
          windowStart: { gte: windowStart }
        },
        orderBy: { windowStart: 'desc' }
      });

      if (existingLimit) {
        // Check if blocked
        if (existingLimit.isBlocked && existingLimit.blockedUntil && existingLimit.blockedUntil > new Date()) {
          return res.status(429).json({
            error: 'Rate Limit Exceeded',
            message: `Too many requests. Try again after ${existingLimit.blockedUntil.toISOString()}`,
            retryAfter: existingLimit.blockedUntil
          });
        }

        // Check if limit exceeded
        if (existingLimit.requestCount >= limit) {
          // Block user
          const blockedUntil = new Date(Date.now() + windowSeconds * 1000);

          await prisma.rateLimit.update({
            where: { id: existingLimit.id },
            data: {
              isBlocked: true,
              blockedUntil
            }
          });

          return res.status(429).json({
            error: 'Rate Limit Exceeded',
            message: `Too many requests. Try again after ${blockedUntil.toISOString()}`,
            retryAfter: blockedUntil
          });
        }

        // Update count
        await prisma.rateLimit.update({
          where: { id: existingLimit.id },
          data: {
            requestCount: { increment: 1 }
          }
        });
      } else {
        // Create new rate limit window
        await prisma.rateLimit.create({
          data: {
            identifier,
            type,
            windowStart: new Date(),
            windowEnd: new Date(Date.now() + windowSeconds * 1000),
            requestCount: 1,
            limit,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent') || 'unknown'
          }
        });
      }

      next();

    } catch (error) {
      console.error('Rate limiting error:', error);
      // Don't block request on rate limit errors
      next();
    }
  };
};

/**
 * Audit Logging Middleware
 * Logs all authenticated requests for audit trail
 */
const auditLogger = async (req, res, next) => {
  try {
    const startTime = Date.now();

    // Override res.json to capture response data
    const originalJson = res.json;
    let responseData = null;

    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    // Continue with request processing
    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;

        // Only log authenticated requests or important endpoints
        if (req.user || req.path.includes('/api/')) {
          await prisma.auditLog.create({
            data: {
              action: 'API_REQUEST',
              entityType: 'api',
              entityId: req.path,
              userAddress: req.user?.address,
              ipAddress: req.ip,
              userAgent: req.get('User-Agent') || 'unknown',
              metadata: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                duration,
                query: req.query,
                body: req.method !== 'GET' ? req.body : undefined,
                response: res.statusCode >= 400 ? responseData : undefined
              },
              severity: res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO',
              category: 'USER_ACTION'
            }
          });
        }
      } catch (auditError) {
        console.error('Audit logging error:', auditError);
      }
    });

    next();

  } catch (error) {
    console.error('Audit logger error:', error);
    next();
  }
};

module.exports = {
  authenticateFirebaseToken,
  requireAdmin,
  requireRole,
  requireKYC,
  rateLimit,
  auditLogger
};