# CommuniShare - Premium Community Sharing App

## Product Overview
A premium community "sharing" app built with React Native (Expo) for frontend and Firebase (Auth & Firestore) for backend.

## Tech Stack
- **Frontend**: React Native (Expo) with expo-router
- **Backend**: Firebase (Auth & Firestore) - Placeholder config provided
- **State Management**: React Context API + AsyncStorage
- **Database**: Firebase Firestore (with MongoDB for payment logs)

## User Roles
1. **Super Admin** - Site owner (designated by email in firebaseConfig.js)
2. **Group Admin** - Group creator
3. **User** - Regular member

## Core Features Implemented

### 1. Authentication & Roles ✓
- Login/Signup flow with Firebase Auth integration
- Mock auth mode for development (when Firebase not configured)
- Super Admin auto-assignment based on configured email
- Role-based access control

### 2. Group System & Directory ✓
- Home screen with category grid (Streaming, Software, Education, Tools)
- Group cards showing Name, Member Count, Premium/Free tags
- Premium groups show price (₹499/month or $9.99/month format)
- Category filtering
- Super Admin can add categories

### 3. Payment & Expiry Logic ✓
- Mock payment simulation on Join Group screen
- Subscription management (30 days)
- Expiration warnings (within 3 days of expiry)
- Grace period (2 days past expiry)
- Auto-revoke chat access after grace period
- Renewal flow

### 4. Real-time Chat ✓
- Group chat interface using Firestore
- Text and link message support
- Link detection and tap-to-open
- Admin "Manage Members" feature

### 5. Admin Features ✓
- Create new groups (Super Admin only)
- Manage group members
- Remove members from groups
- Member stats display (active, expiring, expired)

## File Structure
```
/app/frontend/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   ├── my-groups.tsx
│   │   └── profile.tsx
│   ├── group/
│   │   ├── [id].tsx
│   │   └── join/[id].tsx
│   └── admin/
│       ├── create-group.tsx
│       └── manage-members/[id].tsx
├── src/
│   ├── components/
│   ├── constants/
│   ├── contexts/
│   └── services/
│       └── firebaseConfig.js  ← Configure here
```

## Design Theme
- **Primary**: #2D5BFF (Deep Electric Blue)
- **Background**: #121212 (Matte Black)
- **Premium Badge**: #8A2BE2 (Purple)
- **Border Radius**: 12-16px (rounded corners)
- **Tab Bar**: Glassmorphism effect

## Firebase Configuration
Edit `/app/frontend/src/services/firebaseConfig.js`:
- Replace all `YOUR_*_HERE` placeholders with actual Firebase credentials
- Set `SUPER_ADMIN_EMAIL` to your admin email

## Collections (Firestore Schema)
- `users` - User profiles with roles
- `categories` - Configurable categories
- `groups` - Group information
- `groups/{groupId}/members` - Membership with subscription dates
- `groups/{groupId}/messages` - Chat messages
- `payments` - Payment logs (MongoDB)

## API Endpoints (Backend)
- `POST /api/payments` - Log payment
- `GET /api/payments` - Get all payments
- `GET /api/payments/user/{id}` - User payment history
- `GET /api/payments/group/{id}` - Group payment history
- `GET /api/health` - Health check
