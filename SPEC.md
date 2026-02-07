# HobbyIt - React Native TypeScript App - Complete Specification for GitHub Copilot

## Project Overview
Build a React Native mobile app called "HobbyIt" that helps students track time spent on multiple hobbies and maintain practice streaks to stay motivated and organized.

---

## Tech Stack
- **Framework**: React Native with Expo (TypeScript)
- **Navigation**: React Navigation 6 (Bottom Tabs + Stack Navigator)
- **State Management**: Zustand
- **Backend**: Firebase Firestore
- **Local Storage**: AsyncStorage
- **UI Components**: React Native Paper
- **Icons**: @expo/vector-icons
- **Date Picker**: @react-native-community/datetimepicker

---

## App Architecture

### Navigation Structure
```
Root Navigator (Stack)
├── SplashScreen (initial load, 2s delay)
├── WelcomeScreen (first-time users only)
└── Main App (Bottom Tab Navigator)
    ├── Home Tab (Stack)
    │   ├── HomeScreen
    │   ├── HobbyDetailScreen
    │   └── AddHobbyScreen (modal)
    ├── Add Session Tab (Stack)
    │   └── AddSessionScreen
    └── Stats Tab (Stack)
        └── StatsScreen
```

### Screens List
1. **SplashScreen** - Shows app logo, checks if user exists in AsyncStorage
2. **WelcomeScreen** - One-time user registration (name + location)
3. **HomeScreen** - List all hobbies with stats, FAB to add hobby
4. **HobbyDetailScreen** - Show hobby stats, session history, delete option
5. **AddHobbyScreen** - Create new hobby (name + icon selector)
6. **AddSessionScreen** - Log practice session (hobby, date, duration)
7. **StatsScreen** - Overall stats, most practiced hobby, recent sessions

---

## Data Models (TypeScript Interfaces)

### User Entity
```typescript
interface User {
  user_id: string;
  name: string;
  location: string;
  created_at: string; // ISO 8601
  hobbies: string[]; // Array of hobby IDs
}
```

### Hobby Entity
```typescript
interface Hobby {
  id: string;
  userId: string;
  name: string;
  icon: string; // Emoji
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  // Calculated fields (from sessions)
  totalHours?: number;
  totalSessions?: number;
  currentStreak?: number;
  longestStreak?: number;
}
```

### Session Entity
```typescript
interface Session {
  id: string;
  userId: string;
  hobbyId: string;
  date: string; // ISO date "YYYY-MM-DD"
  durationMinutes: number; // 1-1440 (max 24 hours)
  createdAt: string; // ISO 8601 timestamp
}
```

### Session with Hobby Info (for display)
```typescript
interface SessionWithHobby extends Session {
  hobbyName: string;
  hobbyIcon: string;
}
```

### Stats Summary
```typescript
interface StatsSummary {
  totalHobbies: number;
  totalHours: number;
  totalSessions: number;
  mostPracticedHobby: {
    id: string;
    name: string;
    icon: string;
    hours: number;
  } | null;
}
```

---

## Firebase Firestore Collections

### Collection: `users`
```
users/{userId}
  - user_id: string
  - name: string
  - location: string
  - created_at: timestamp
  - hobbies: array<string>
```

### Collection: `hobbies`
```
hobbies/{hobbyId}
  - userId: string (index)
  - name: string
  - icon: string
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Collection: `sessions`
```
sessions/{sessionId}
  - userId: string (index)
  - hobbyId: string (index)
  - date: string (YYYY-MM-DD)
  - durationMinutes: number
  - createdAt: timestamp
```

**Indexes needed:**
- `sessions`: compound index on (userId, date DESC)
- `sessions`: compound index on (hobbyId, date DESC)
- `hobbies`: index on userId

---

## API Service Layer (src/services/hobbyApi.ts)

### Required API Methods

```typescript
// User APIs
createUser(name: string, location: string): Promise<User>
getUserProfile(userId: string): Promise<User>

// Hobby APIs
getUserHobbies(userId: string): Promise<Hobby[]>
createHobby(userId: string, name: string, icon: string): Promise<Hobby>
deleteHobby(hobbyId: string, userId: string): Promise<void>

// Session APIs
createSession(userId: string, hobbyId: string, date: string, durationMinutes: number): Promise<Session>
getRecentSessions(userId: string, days?: number): Promise<SessionWithHobby[]>
deleteSession(sessionId: string): Promise<void>

// Stats APIs
getHobbyStats(hobbyId: string, userId: string): Promise<HobbyStats>
getStatsSummary(userId: string): Promise<StatsSummary>

// Helper function
calculateStreak(dates: string[]): number
```

---

## Zustand Store (src/store/hobbyStore.ts)

### State Structure
```typescript
interface HobbyStore {
  // State
  user: User | null;
  userId: string | null;
  hobbies: Hobby[];
  sessions: SessionWithHobby[];
  stats: StatsSummary | null;
  isLoading: boolean;
  error: string | null;
  
  // User Actions
  setUser: (user: User) => void;
  loadUserId: () => Promise<string | null>;
  createUser: (name: string, location: string) => Promise<User>;
  
  // Hobby Actions
  loadHobbies: () => Promise<void>;
  addHobby: (name: string, icon: string) => Promise<Hobby>;
  deleteHobby: (hobbyId: string) => Promise<void>;
  
  // Session Actions
  loadRecentSessions: (days?: number) => Promise<void>;
  addSession: (hobbyId: string, date: string, durationMinutes: number) => Promise<Session>;
  deleteSession: (sessionId: string) => Promise<void>;
  
  // Stats Actions
  loadStats: () => Promise<void>;
}
```

---

## Critical Business Logic

### 1. Streak Calculation Algorithm
```typescript
/**
 * CRITICAL: Calculates current streak from array of session dates
 * 
 * Requirements:
 * - Compare calendar days only (ignore time)
 * - Check consecutive days backward from today
 * - Stop at first gap > 1 day
 * - Handle multiple sessions per day (count day once)
 * - Handle timezone correctly
 * 
 * Edge Cases:
 * - Session at 11:59 PM one day, 12:01 AM next day = 2 consecutive days
 * - No sessions = 0 streak
 * - Last session was yesterday or today = streak continues
 * - Last session was 2+ days ago = streak is 0
 */
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  // Sort dates descending (newest first)
  const sortedDates = [...new Set(dates)].sort().reverse();
  
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = new Date(today);
  
  for (const dateStr of sortedDates) {
    const sessionDate = new Date(dateStr);
    const daysDiff = Math.floor(
      (checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff <= 1) {
      streak++;
      checkDate = sessionDate;
    } else {
      break; // Gap detected, stop counting
    }
  }
  
  return streak;
}
```

### 2. Delete Hobby with Cascade
```typescript
/**
 * CRITICAL: When deleting hobby, must also:
 * 1. Delete ALL sessions for this hobby
 * 2. Remove hobbyId from user's hobbies array
 * 3. Delete the hobby document
 * 
 * Use Firestore batch for atomic operation
 */
async function deleteHobby(hobbyId: string, userId: string): Promise<void> {
  // 1. Get all sessions for this hobby
  const sessionsSnapshot = await sessionsCollection
    .where('hobbyId', '==', hobbyId)
    .where('userId', '==', userId)
    .get();
  
  // 2. Batch delete all sessions
  const batch = firestore().batch();
  sessionsSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  
  // 3. Remove from user's hobbies array
  await usersCollection.doc(userId).update({
    hobbies: FieldValue.arrayRemove(hobbyId)
  });
  
  // 4. Delete hobby document
  await hobbiesCollection.doc(hobbyId).delete();
}
```

### 3. Input Validation Rules
```typescript
// Session duration validation
function validateSessionDuration(minutes: number): boolean {
  return minutes >= 1 && minutes <= 1440; // 1 min to 24 hours
}

// Session date validation
function validateSessionDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  
  // Must be valid date
  if (isNaN(date.getTime())) return false;
  
  // Cannot be in the future
  if (date > today) return false;
  
  return true;
}

// Hobby name validation
function validateHobbyName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 50;
}
```

---

## UI/UX Requirements

### Color Palette
```typescript
const colors = {
  primary: '#6366F1',      // Indigo
  secondary: '#10B981',    // Green
  accent: '#F59E0B',       // Amber
  background: '#F9FAFB',   // Light Gray
  surface: '#FFFFFF',      // White
  error: '#EF4444',        // Red
  text: '#1F2937',         // Dark Gray
  textSecondary: '#6B7280', // Medium Gray
  border: '#E5E7EB',       // Light Border
};
```

### Typography
```typescript
const fonts = {
  title: { fontSize: 28, fontWeight: 'bold' as const },
  heading: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: 'normal' as const },
  caption: { fontSize: 14, color: '#6B7280' },
  label: { fontSize: 16, fontWeight: '600' as const },
};
```

### Common Components Needed
1. **HobbyCard** - Display hobby with icon, name, hours, streak
2. **SessionCard** - Display session with date, duration, hobby info
3. **StatCard** - Display single stat value with label
4. **OfflineBanner** - Show "You're offline" warning at top
5. **EmptyState** - Show when no data exists
6. **LoadingSpinner** - Show while loading data

### Hobby Icons Available
```typescript
const HOBBY_ICONS = [
  '🎸', '🎨', '💪', '📚', '🏃‍♂️', '🍳', 
  '🎮', '📷', '✍️', '🧘', '⚽', '🎹'
];
```

---

## Screen-Specific Requirements

### SplashScreen
- Show app logo/icon centered
- Display "HobbyIt" title
- Show loading spinner
- After 2 seconds, check AsyncStorage for userId
- Navigate to WelcomeScreen if no userId, else MainApp

### WelcomeScreen
- Form with 2 fields: name (required), location (optional)
- Validate name is 2+ characters
- Create user in Firebase on submit
- Save userId to AsyncStorage
- Navigate to Main App (replace stack)

### HomeScreen
- Header with greeting "Hello, {name}! 👋"
- FlatList of hobby cards (if empty, show empty state)
- Each card shows: icon, name, total hours, current streak
- Pull-to-refresh to reload data
- FAB (Floating Action Button) at bottom-right to add hobby
- Tap card to navigate to HobbyDetailScreen

### HobbyDetailScreen
- Header with large icon and hobby name
- 4 stat cards in grid: Total Hours, Sessions, Current Streak, Longest Streak
- "Log Session" button (navigate to AddSessionScreen with pre-selected hobby)
- Recent sessions list (last 10)
- Delete button at bottom (with confirmation alert)

### AddHobbyScreen
- Modal presentation
- Text input for hobby name
- Grid of emoji icons to select
- Selected icon has border/background highlight
- Save button at bottom
- Validate name before saving
- Close modal and refresh hobby list on success

### AddSessionScreen
- List of hobbies to select from (radio button style)
- Date picker (default: today, max: today)
- Duration input with +/- buttons for hours and minutes
- Hours: 0-24, Minutes: 0, 15, 30, 45 (increments of 15)
- Save button
- Validate: hobby selected, duration > 0, valid date
- Show success alert and navigate back

### StatsScreen
- Summary card with total hobbies, total hours, total sessions
- "Most Practiced" card with hobby icon, name, hours
- Recent sessions list (last 30 days)
- Each session shows: hobby icon, name, date, duration

---

## Offline Strategy

### Requirements
- Show orange banner at top when offline: "⚠️ You're offline - showing saved data"
- Disable all "Add" and "Delete" buttons when offline
- Allow viewing all cached data (read-only mode)
- Firebase automatically caches data
- Use NetInfo to detect connection status

### Implementation
```typescript
import NetInfo from '@react-native-community/netinfo';

const [isOnline, setIsOnline] = useState(true);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected ?? false);
  });
  return () => unsubscribe();
}, []);
```

---

## Error Handling

### All API calls must:
1. Wrap in try-catch block
2. Show user-friendly error Alert on failure
3. Log error to console
4. Set error state in Zustand store

### Example:
```typescript
try {
  setLoading(true);
  await HobbyAPI.createHobby(userId, name, icon);
  Alert.alert('Success', 'Hobby created!');
} catch (error) {
  console.error('Error creating hobby:', error);
  Alert.alert('Error', 'Failed to create hobby. Please try again.');
} finally {
  setLoading(false);
}
```

---

## File Structure

```
hobby-tracker/
├── index.tsx                 # Entry point
├── src/
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── WelcomeScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── HobbyDetailScreen.tsx
│   │   ├── AddHobbyScreen.tsx
│   │   ├── AddSessionScreen.tsx
│   │   └── StatsScreen.tsx
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── MainNavigator.tsx (Bottom Tabs)
│   │   ├── HomeStack.tsx
│   │   └── StatsStack.tsx
│   │
│   ├── components/
│   │   ├── HobbyCard.tsx
│   │   ├── SessionCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── OfflineBanner.tsx
│   │   └── EmptyState.tsx
│   │
│   ├── services/
│   │   └── hobbyApi.ts
│   │
│   ├── store/
│   │   └── hobbyStore.ts
│   │
│   ├── types/
│   │   └── index.ts (all TypeScript interfaces)
│   │
│   ├── config/
│   │   └── firebase.ts
│   │
│   └── utils/
│       ├── dateUtils.ts
│       └── validation.ts
│
├── assets/
├── package.json
├── tsconfig.json
└── app.json
```

---

## Dependencies to Install

```bash
# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context

# State Management
npm install zustand

# Firebase
npm install firebase

# Storage
npx expo install @react-native-async-storage/async-storage

# Network Status
npx expo install @react-native-community/netinfo

# Date Picker
npx expo install @react-native-community/datetimepicker

# UI Components
npm install react-native-paper
npx expo install @expo/vector-icons
```

---

## Security Notes (For Development)

### Current Setup (MVP - Test Mode)
- Firebase security rules set to: `allow read, write: if true`
- No authentication required
- userId passed in request body (not verified)

### Known Security Risks:
1. Anyone can read/write any data
2. No ownership verification before delete
3. No input validation on server side
4. No rate limiting

### For Production (Future):
- Add Firebase Anonymous Authentication
- Implement security rules requiring `request.auth.uid == resource.data.userId`
- Add server-side validation
- Implement rate limiting

---

## Testing Checklist

### Manual Testing Required:
- [ ] Create user (first launch)
- [ ] Create hobby with emoji icon
- [ ] Log session for hobby (today's date)
- [ ] Log session for hobby (past date)
- [ ] View hobby detail page
- [ ] Delete session
- [ ] Delete hobby (verify sessions also deleted)
- [ ] Check streak calculation with consecutive days
- [ ] Check streak breaks after gap
- [ ] Test offline mode (airplane mode)
- [ ] Test with multiple hobbies and sessions
- [ ] Verify data persists after app restart

---

## GitHub Copilot Usage Instructions

### How to Use This Spec:

1. **Save this file** as `SPEC.md` in project root
2. **Open GitHub Copilot Chat** in VS Code
3. **Reference this file** when asking Copilot to generate code

### Example Prompts:

```
@workspace /new Create a new TypeScript React Native Expo project following SPEC.md

Generate src/types/index.ts with all TypeScript interfaces from SPEC.md

Generate src/services/hobbyApi.ts with Firebase implementation following SPEC.md

Create src/screens/HomeScreen.tsx following the design in SPEC.md

Implement calculateStreak function exactly as specified in SPEC.md

Generate Zustand store following SPEC.md requirements

Create navigation structure as defined in SPEC.md
```

### When Generating Screens:
```
Generate {ScreenName} following SPEC.md requirements:
- Use TypeScript
- Follow color palette from SPEC.md
- Implement all required functionality
- Add proper error handling
- Include loading states
```

### When Generating Components:
```
Create {ComponentName} component:
- Props from SPEC.md types
- Styling from SPEC.md colors
- Handle edge cases
```

---

## Success Criteria

✅ **User can:**
1. Create account on first launch
2. Add multiple hobbies with icons
3. Log practice sessions with date and duration
4. View total hours and streaks per hobby
5. See all sessions in history
6. Delete hobbies and sessions
7. Use app offline (read-only)

✅ **Code quality:**
1. TypeScript with proper types
2. Error handling on all async operations
3. Loading states for all data fetches
4. Validation on all user inputs
5. Clean, readable code structure

✅ **Performance:**
1. App loads in < 3 seconds
2. Navigation is smooth (no lag)
3. Data updates appear within 1 second
4. No memory leaks

---

## Build & Run Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android emulator
npx expo start --android

# Run on iOS simulator (Mac only)
npx expo start --ios

# Run in web browser
npx expo start --web

# Clear cache and restart
npx expo start -c
```

---

## Important Notes for AI Code Generation

1. **Always use TypeScript** - Not JavaScript
2. **Follow React hooks rules** - No hooks in loops/conditions
3. **Handle all errors** - Every async function needs try-catch
4. **Validate all inputs** - Client-side validation before API calls
5. **Use proper types** - No `any` types
6. **Follow file structure** - Exact folder/file naming from SPEC
7. **Use Firestore best practices** - Batch operations for multiple writes
8. **Implement streak logic correctly** - Edge cases are critical
9. **Test cascade deletes** - Hobby deletion must remove sessions
10. **Handle offline gracefully** - Show banner, disable write operations

---

**END OF SPECIFICATION**