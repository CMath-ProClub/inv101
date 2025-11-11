/**
 * Clerk Authentication Middleware
 * Replaces passport.js with Clerk authentication
 */

const { ClerkExpressRequireAuth, ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const User = require('./models/User');

/**
 * Initialize Clerk with environment variables
 */
function initializeClerk() {
  if (!process.env.CLERK_SECRET_KEY) {
    console.warn('⚠️ CLERK_SECRET_KEY not set - Clerk authentication disabled');
    return false;
  }
  
  console.log('✅ Clerk authentication initialized');
  return true;
}

/**
 * Middleware to require authentication
 * Use this for protected routes
 */
const requireAuth = ClerkExpressRequireAuth({
  onError: (error) => {
    console.error('Clerk auth error:', error);
  }
});

/**
 * Middleware to optionally get auth if present
 * Use this for routes that work with or without auth
 */
const withAuth = ClerkExpressWithAuth({
  onError: (error) => {
    console.error('Clerk auth error:', error);
  }
});

/**
 * Sync Clerk user with MongoDB User model
 * This ensures we have a local user record for Clerk users
 */
async function syncClerkUser(req, res, next) {
  try {
    if (!req.auth || !req.auth.userId) {
      return next();
    }

    const clerkId = req.auth.userId;
    
    // Try to find existing user by Clerk ID
    let user = await User.findOne({ clerkId });
    
    // If no user found, get user info from Clerk and create record
    if (!user) {
      const { clerkClient } = require('@clerk/clerk-sdk-node');
      const clerkUser = await clerkClient.users.getUser(clerkId);
      
      const email = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase();
      const username = clerkUser.username || email?.split('@')[0] || `user_${clerkId.substring(0, 8)}`;
      
      // Check if user exists with this email (from old auth system)
      user = await User.findOne({ email });
      
      if (user) {
        // Migrate existing user to Clerk
        user.clerkId = clerkId;
        user.provider = 'clerk';
        user.providerId = clerkId;
        await user.save();
        console.log(`✅ Migrated existing user ${email} to Clerk`);
      } else {
        // Create new user
        user = await User.create({
          clerkId,
          email,
          username,
          displayName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || username,
          provider: 'clerk',
          providerId: clerkId,
          profileImage: clerkUser.imageUrl
        });
        console.log(`✅ Created new Clerk user: ${email}`);
      }
    }
    
    // Attach user to request for downstream middleware
    req.user = user;
    next();
  } catch (error) {
    console.error('Error syncing Clerk user:', error);
    next(error);
  }
}

/**
 * Get user from Clerk auth
 * Combines requireAuth + syncClerkUser
 */
const getClerkUser = [requireAuth, syncClerkUser];

/**
 * Optional auth with user sync
 * Combines withAuth + syncClerkUser
 */
const optionalClerkUser = [withAuth, syncClerkUser];

module.exports = {
  initializeClerk,
  requireAuth,
  withAuth,
  syncClerkUser,
  getClerkUser,
  optionalClerkUser
};
