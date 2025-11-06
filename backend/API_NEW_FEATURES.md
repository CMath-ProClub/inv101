# New Features API Documentation

This document describes the new API endpoints added for notifications, achievements, activity feed, and leaderboards.

## Table of Contents

1. [Notifications API](#notifications-api)
2. [Achievements API](#achievements-api)
3. [Activity Feed API](#activity-feed-api)
4. [Leaderboards API](#leaderboards-api)
5. [Real-time Features](#real-time-features)
6. [Setup Instructions](#setup-instructions)

---

## Notifications API

Base URL: `/api/notifications`

### Get User Notifications

```http
GET /api/notifications
```

**Query Parameters:**
- `type` (optional): Filter by notification type (`friend_request`, `achievement`, `lesson`, `portfolio`, `trade`, `system`)
- `isRead` (optional): Filter by read status (`true` or `false`)
- `limit` (optional): Number of notifications to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "notifications": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  },
  "unreadCount": 12
}
```

### Mark Notification as Read

```http
PUT /api/notifications/:id/read
```

### Mark All as Read

```http
PUT /api/notifications/mark-all-read
```

### Delete Notification

```http
DELETE /api/notifications/:id
```

### Get Notification Counts

```http
GET /api/notifications/counts
```

**Response:**
```json
{
  "success": true,
  "counts": {
    "friend_request": 3,
    "achievement": 2,
    "lesson": 5
  },
  "totalUnread": 10
}
```

---

## Achievements API

Base URL: `/api/achievements`

### Get All Achievements with Progress

```http
GET /api/achievements
```

**Query Parameters:**
- `category` (optional): Filter by category (`trading`, `learning`, `social`, `milestones`, `all`)

**Response:**
```json
{
  "success": true,
  "achievements": [
    {
      "_id": "...",
      "name": "first_trade",
      "title": "First Trade",
      "description": "Execute your first trade",
      "icon": "🎯",
      "category": "trading",
      "rarity": "common",
      "points": 10,
      "progress": 1,
      "isUnlocked": true,
      "unlockedAt": "2024-11-06T..."
    }
  ],
  "stats": {
    "total": 24,
    "unlocked": 12,
    "completion": 50,
    "totalPoints": 1250
  }
}
```

### Get Specific Achievement

```http
GET /api/achievements/:id
```

### Update Achievement Progress

```http
POST /api/achievements/:id/progress
```

**Body:**
```json
{
  "progress": 5
}
```

**Response:**
```json
{
  "success": true,
  "userAchievement": {...},
  "justUnlocked": true
}
```

### Get Recently Unlocked

```http
GET /api/achievements/recent/unlocked?limit=10
```

---

## Activity Feed API

Base URL: `/api/activity`

### Get Friends' Activity Feed

```http
GET /api/activity
```

**Query Parameters:**
- `type` (optional): Filter by activity type (`trade`, `lesson`, `achievement`, `friend`, `milestone`, `all`)
- `limit` (optional): Number of activities (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "_id": "...",
      "userId": {
        "_id": "...",
        "username": "john_doe",
        "profilePicture": "..."
      },
      "type": "trade",
      "action": "Bought 15 shares of NVDA",
      "data": {
        "symbol": "NVDA",
        "shares": 15,
        "price": 498.23
      },
      "createdAt": "2024-11-06T..."
    }
  ],
  "pagination": {...}
}
```

### Get User's Own Activities

```http
GET /api/activity/me
```

### Create Activity

```http
POST /api/activity
```

**Body:**
```json
{
  "type": "trade",
  "action": "Bought 10 shares of AAPL",
  "data": {
    "symbol": "AAPL",
    "shares": 10,
    "price": 178.50
  },
  "visibility": "friends"
}
```

---

## Leaderboards API

Base URL: `/api/leaderboards`

### Get Leaderboard

```http
GET /api/leaderboards
```

**Query Parameters:**
- `category`: Leaderboard type (`portfolio_value`, `best_returns`, `lessons_completed`, `learning_streak`)
- `period`: Time period (`today`, `week`, `month`, `all`)
- `limit`: Number of entries (default: 100)

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "userId": "...",
      "username": "emily_brown",
      "profilePicture": "...",
      "value": 82450,
      "change": 12.5
    }
  ],
  "userPosition": 5,
  "category": "portfolio_value",
  "period": "week"
}
```

### Get User's Rank

```http
GET /api/leaderboards/rank?category=portfolio_value
```

**Response:**
```json
{
  "success": true,
  "rank": 5,
  "value": 52450,
  "totalUsers": 1000,
  "percentile": 99
}
```

---

## Real-time Features

### Socket.io Setup

To enable real-time updates:

1. **Install Socket.io:**
```bash
npm install socket.io
```

2. **Initialize in index.js:**
```javascript
const http = require('http');
const server = http.createServer(app);
const socketService = require('./services/socketService');
socketService.initialize(server);
```

3. **Client Connection:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Listen for notifications
socket.on('new_notification', (notification) => {
  console.log('New notification:', notification);
});

// Listen for friend activities
socket.on('friend_activity', (activity) => {
  console.log('Friend activity:', activity);
});

// Subscribe to leaderboard updates
socket.emit('subscribe_leaderboard', 'portfolio_value');
socket.on('leaderboard_update', (data) => {
  console.log('Leaderboard updated:', data);
});
```

### Events

**Server → Client:**
- `new_notification` - New notification received
- `friend_activity` - Friend performed an action
- `leaderboard_update` - Leaderboard rankings changed

**Client → Server:**
- `subscribe_leaderboard(category)` - Subscribe to leaderboard updates
- `unsubscribe_leaderboard(category)` - Unsubscribe from updates

---

## Setup Instructions

### 1. Seed Achievements

Run the seeding script to populate initial achievements:

```bash
cd backend
node scripts/seed-achievements.js
```

### 2. Environment Variables

No new environment variables required. Uses existing MongoDB connection.

### 3. Update User Model (Optional)

Add friends field to User model if not present:

```javascript
friends: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}]
```

### 4. Test Endpoints

```bash
# Get achievements
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/achievements

# Get notifications
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/notifications

# Get activity feed
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/activity

# Get leaderboard
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/leaderboards?category=portfolio_value
```

---

## Models Created

### Achievement
- `name`: Unique identifier
- `title`: Display name
- `description`: Achievement description
- `icon`: Emoji icon
- `category`: trading, learning, social, milestones
- `rarity`: common, rare, epic, legendary
- `points`: Points awarded
- `criteria`: Unlock conditions

### UserAchievement
- `userId`: Reference to User
- `achievementId`: Reference to Achievement
- `progress`: Current progress
- `isUnlocked`: Unlock status
- `unlockedAt`: Unlock timestamp

### Notification
- `userId`: Reference to User
- `type`: Notification type
- `title`: Notification title
- `message`: Notification message
- `data`: Additional data (JSON)
- `isRead`: Read status
- `expiresAt`: Expiration date (TTL)

### Activity
- `userId`: Reference to User
- `type`: Activity type
- `action`: Action description
- `data`: Activity data (JSON)
- `visibility`: public, friends, private

---

## Integration Examples

### Frontend Integration

```javascript
// Fetch achievements
async function loadAchievements() {
  const response = await fetch('/api/achievements', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  displayAchievements(data.achievements);
}

// Mark notification as read
async function markNotificationRead(notificationId) {
  await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

// Load activity feed
async function loadActivityFeed() {
  const response = await fetch('/api/activity?type=all&limit=20', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  displayActivities(data.activities);
}
```

### Achievement Progress Tracking

Automatically track progress when events occur:

```javascript
// After completing a trade
const trade = await createTrade(...);

// Update achievement progress
await fetch(`/api/achievements/${tradeAchievementId}/progress`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    progress: userTotalTrades
  })
});
```

---

## Performance Considerations

1. **Caching**: Leaderboards should be cached (Redis recommended)
2. **Pagination**: Always use pagination for large datasets
3. **Indexes**: All models have proper indexes for queries
4. **TTL**: Notifications auto-expire after 30 days
5. **Socket.io**: Optional, degrades gracefully if not installed

---

## Future Enhancements

- [ ] Push notifications (FCM/APNS)
- [ ] Email digests for notifications
- [ ] Leaderboard seasons/competitions
- [ ] Achievement sharing to social media
- [ ] Custom achievement badges/images
- [ ] Friend challenges and competitions
- [ ] Activity filtering preferences
- [ ] Notification preferences/muting

---

For questions or issues, please refer to the main project documentation or create an issue on GitHub.
