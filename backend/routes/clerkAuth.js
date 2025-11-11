/**
 * Clerk Authentication Routes
 * Handles Clerk webhooks and session management
 */

const express = require('express');
const router = express.Router();
const { Webhook } = require('svix');
const User = require('../models/User');
const { requireAuth, optionalClerkUser } = require('../clerkAuth');

/**
 * Clerk Webhook Handler
 * Syncs user data from Clerk to MongoDB
 * 
 * Set up webhook in Clerk Dashboard:
 * 1. Go to Webhooks section
 * 2. Add endpoint: https://your-domain.com/auth/clerk-webhook
 * 3. Subscribe to events: user.created, user.updated, user.deleted
 * 4. Copy webhook secret to CLERK_WEBHOOK_SECRET env variable
 */
router.post('/clerk-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error('CLERK_WEBHOOK_SECRET is not set');
    }

    // Get headers
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    // If any of the headers are missing, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Missing svix headers' });
    }

    // Create Svix instance with webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    // Verify webhook
    try {
      evt = wh.verify(req.body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    // Handle the webhook
    const { id, ...attributes } = evt.data;
    const eventType = evt.type;

    console.log(`📥 Clerk webhook received: ${eventType}`);

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(id, attributes);
        break;
      
      case 'user.updated':
        await handleUserUpdated(id, attributes);
        break;
      
      case 'user.deleted':
        await handleUserDeleted(id);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * Handle user.created webhook
 */
async function handleUserCreated(clerkId, userData) {
  try {
    const email = userData.email_addresses?.[0]?.email_address?.toLowerCase();
    const username = userData.username || email?.split('@')[0] || `user_${clerkId.substring(0, 8)}`;
    
    // Check if user already exists
    let user = await User.findOne({ clerkId });
    
    if (user) {
      console.log(`User already exists with Clerk ID: ${clerkId}`);
      return user;
    }
    
    // Check if email already exists (migration from old auth)
    if (email) {
      user = await User.findOne({ email });
      if (user) {
        // Migrate existing user to Clerk
        user.clerkId = clerkId;
        user.provider = 'clerk';
        user.providerId = clerkId;
        user.profileImage = userData.image_url;
        await user.save();
        console.log(`✅ Migrated existing user ${email} to Clerk`);
        return user;
      }
    }
    
    // Create new user
    user = await User.create({
      clerkId,
      email,
      username,
      displayName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || username,
      provider: 'clerk',
      providerId: clerkId,
      profileImage: userData.image_url,
      avatar: userData.image_url
    });
    
    console.log(`✅ Created new user from Clerk: ${email}`);
    return user;
  } catch (error) {
    console.error('Error handling user.created:', error);
    throw error;
  }
}

/**
 * Handle user.updated webhook
 */
async function handleUserUpdated(clerkId, userData) {
  try {
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      console.log(`User not found for Clerk ID: ${clerkId}, creating...`);
      return await handleUserCreated(clerkId, userData);
    }
    
    // Update user data
    const email = userData.email_addresses?.[0]?.email_address?.toLowerCase();
    if (email) user.email = email;
    
    if (userData.username) user.username = userData.username;
    if (userData.image_url) {
      user.profileImage = userData.image_url;
      user.avatar = userData.image_url;
    }
    
    const displayName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
    if (displayName) user.displayName = displayName;
    
    await user.save();
    console.log(`✅ Updated user from Clerk: ${email}`);
    return user;
  } catch (error) {
    console.error('Error handling user.updated:', error);
    throw error;
  }
}

/**
 * Handle user.deleted webhook
 */
async function handleUserDeleted(clerkId) {
  try {
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      console.log(`User not found for Clerk ID: ${clerkId}`);
      return;
    }
    
    // Option 1: Soft delete (recommended)
    user.provider = 'deleted';
    user.email = `deleted_${user.email}`;
    user.username = `deleted_${user.username}`;
    await user.save();
    
    // Option 2: Hard delete (uncomment if preferred)
    // await User.deleteOne({ clerkId });
    
    console.log(`✅ Deleted user from Clerk: ${clerkId}`);
  } catch (error) {
    console.error('Error handling user.deleted:', error);
    throw error;
  }
}

/**
 * GET /auth/session
 * Get current user session
 */
router.get('/session', optionalClerkUser, async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.json({ authenticated: false });
    }

    // User was synced by optionalClerkUser middleware
    const user = req.user;

    res.json({
      authenticated: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        profileImage: user.profileImage || user.avatar,
        level: user.level,
        xp: user.xp,
        provider: user.provider
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

/**
 * POST /auth/sign-out
 * Sign out user (handled by Clerk on frontend)
 * This endpoint just confirms the sign-out
 */
router.post('/sign-out', (req, res) => {
  res.json({ success: true, message: 'Signed out successfully' });
});

module.exports = router;
