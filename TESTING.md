# Next-Chapter Testing Checklist

## Pre-Testing Setup

- [ ] Start backend: `cd /home/openclaw/next-chapter/backend && npm run dev`
- [ ] Start frontend: `cd /home/openclaw/next-chapter/frontend && npm run dev`
- [ ] Open browser DevTools (F12) for console errors
- [ ] Have 2+ browser windows/tabs ready for multi-account testing
- [ ] Test on mobile: Toggle Device Toolbar (F12 → Ctrl+Shift+M)

---

## Test Case 1: Complete Signup Flow ✓

### Account A: First User Signup
- [ ] Navigate to http://localhost:5176
- [ ] Click "Sign Up" link
- [ ] Fill form:
  - First Name: "Alice"
  - Last Name: "Smith"
  - Email: "alice@test.com"
  - Password: "password123"
  - Confirm Password: "password123"
- [ ] Click "Sign Up" button
- [ ] **Expected:** Redirected to profile setup page
- [ ] **Verify:** No error messages, page loads quickly
- [ ] Complete Profile Setup:
  - Age: "32"
  - Location: "Chicago, IL"
  - Bio: "Single parent, love hiking"
  - Click "Continue to Discover"
- [ ] **Expected:** Redirected to Discover page with "No more profiles" message (no other users yet)
- [ ] **Verify:** Page loads, navigation links visible

### Account B: Second User Signup
- [ ] Open incognito/private window or different browser
- [ ] Repeat signup with different email: "bob@test.com"
- [ ] Complete same steps as Account A
- [ ] **Expected:** Both accounts created, Profile setup successful
- [ ] **Verify:** No crashes, data persists

---

## Test Case 2: Responsive Design ✓

### Desktop View (Full Width)
- [ ] All pages display properly
- [ ] Navigation is horizontal
- [ ] Images and cards are well-sized
- [ ] No horizontal scrolling

### Tablet View (768px)
- [ ] Toggle DevTools mobile view to 768px
- [ ] Test each page:
  - [ ] Discover page: Profile card fits, buttons visible
  - [ ] Matches page: Grid layout works
  - [ ] Messages page: Conversation list readable
  - [ ] Preferences page: Sliders work
- [ ] **Expected:** No layout breaks, all touch targets accessible

### Mobile View (375px - iPhone SE)
- [ ] Toggle DevTools to 375px width
- [ ] Test each page:
  - [ ] Discover: Card full-width, buttons stacked
  - [ ] Matches: Single column layout
  - [ ] Messages: Responsive avatars and text
  - [ ] Preferences: Sliders accessible
- [ ] **Verify:** 
  - No horizontal scroll
  - All buttons are min-height 44px (touch-friendly)
  - Text is readable
  - Navigation is accessible

---

## Test Case 3: Discover & Matching Flow ✓

### Account A: Discover Profiles
- [ ] Log in as Account A (alice@test.com)
- [ ] Click "⚙️ Preferences" 
- [ ] Verify:
  - [ ] Age range sliders work
  - [ ] "Looking For" dropdown has options
  - [ ] Distance slider works
  - [ ] "Save Preferences" button works
- [ ] Go back to Discover page
- [ ] **Expected:** See Account B's profile
- [ ] **Verify:** 
  - [ ] Profile card shows: Name, Age, Location, Bio
  - [ ] Profile image placeholder appears
  - [ ] Like (♥) and Pass (✗) buttons are clickable
  - [ ] Like button responds immediately

### Account B: Discover Profiles
- [ ] Switch to Account B (incognito window)
- [ ] Go to Discover page
- [ ] **Expected:** See Account A's profile
- [ ] Click ♥ Like button on Account A
- [ ] **Expected:** Message appears "🎉 It's a match with Alice!"

### Account A: Check Match Notification
- [ ] Switch back to Account A window (refresh if needed)
- [ ] Click ♥ Like on Account B's profile
- [ ] **Expected:** 
  - [ ] "🎉 It's a match!" message shows for 3 seconds
  - [ ] After 3 sec, moves to next profile (or "No more profiles")

### Both Accounts: Verify Mutual Match
- [ ] Account A: Click 💬 Messages
- [ ] **Expected:** See Account B in conversation list
- [ ] Account B: Click 💬 Messages
- [ ] **Expected:** See Account A in conversation list

---

## Test Case 4: Real-Time Messaging ✓

### Prepare: Open 2 Chat Windows Side-by-Side
- [ ] Account A: Go to Messages → Click on Account B's conversation
- [ ] Account B: Go to Messages → Click on Account A's conversation
- [ ] Arrange windows side-by-side on desktop (or flip between tabs on mobile)

### Account A: Send Message
- [ ] In chat window, type message: "Hi Bob!"
- [ ] Click Send button
- [ ] **Expected:** 
  - [ ] Message appears in Account A's chat (right-aligned, pink background)
  - [ ] Input field clears
  - [ ] Button shows normal state

### Account B: Receive Message (Real-Time)
- [ ] **Expected (within 2 seconds due to polling):**
  - [ ] Message "Hi Bob!" appears in Account B's chat
  - [ ] Message is left-aligned with white background
  - [ ] Timestamp shows correct time
  - [ ] NO page refresh needed

### Account B: Reply
- [ ] Type message: "Hey Alice! How are you?"
- [ ] Send message
- [ ] **Expected:** Message appears in Account B's chat, timestamp visible

### Account A: Receive Reply
- [ ] **Expected (within 2 seconds):** Reply appears without page refresh
- [ ] **Verify:** Message history shows both messages in conversation

### Both Accounts: Refresh & Persistence
- [ ] Account A: Hard refresh (Ctrl+Shift+R)
- [ ] **Expected:** 
  - [ ] Stays in same conversation (URL: /messages/[matchId])
  - [ ] All message history loads
  - [ ] Can continue chatting

- [ ] Account B: Hard refresh
- [ ] **Expected:** Same behavior as Account A

---

## Test Case 5: Error Handling & Edge Cases ✓

### Network Error Simulation
- [ ] Open DevTools → Network tab
- [ ] Simulate offline: Network tab → Throttling dropdown → "Offline"
- [ ] Try to:
  - [ ] Send a message → **Expected:** Error message appears (not console error)
  - [ ] Load Discover page → **Expected:** Graceful error message
  - [ ] Load Matches → **Expected:** Error handling shows
- [ ] Re-enable network, try action again → **Expected:** Works normally

### Invalid Input Handling
- [ ] Sign up page: Try signup with:
  - [ ] Empty email → **Expected:** Error message or validation
  - [ ] Password too short → **Expected:** Error message
  - [ ] Mismatched passwords → **Expected:** Error message "Passwords do not match"

### State Persistence
- [ ] Account A: Go to Discover page
- [ ] Refresh page → **Expected:** Still on Discover, still logged in
- [ ] Open DevTools → Application → Local Storage
- [ ] **Verify:** authToken exists
- [ ] Log out (if logout button exists) or delete authToken manually
- [ ] **Expected:** Redirected to login page on next navigation

---

## Test Case 6: Navigation & Routing ✓

### Navigation Links
- [ ] From Discover page:
  - [ ] Click 💬 Messages → **Expected:** Goes to Messages page
  - [ ] Click 💕 Matches → **Expected:** Goes to Matches page
  - [ ] Click ⚙️ Preferences → **Expected:** Goes to Preferences page
  - [ ] Click back button → **Expected:** Goes back (or to Discover)

- [ ] From Matches page:
  - [ ] Click ← Discover → **Expected:** Goes to Discover page
  - [ ] Click 💬 Messages → **Expected:** Goes to Messages page
  - [ ] Click on a match card → **Expected:** Opens Messages for that person

- [ ] From Messages page:
  - [ ] Click ← Back → **Expected:** Goes back to Matches (or Messages list)
  - [ ] Click on a conversation → **Expected:** Opens chat window
  - [ ] In chat, click ← Back → **Expected:** Goes back to conversations list

### Direct URL Navigation
- [ ] Paste directly in address bar:
  - [ ] http://localhost:5176/discover → **Expected:** Loads if logged in, else redirects to login
  - [ ] http://localhost:5176/messages → **Expected:** Loads if logged in
  - [ ] http://localhost:5176/preferences → **Expected:** Loads if logged in
  - [ ] http://localhost:5176/login → **Expected:** Loads if not logged in, else redirects to /discover

---

## Test Case 7: Performance & UX Polish ✓

### Loading States
- [ ] Discover page:
  - [ ] On first load, **Expected:** Loading spinner shows (if slow network)
  - [ ] After data loads, spinner disappears
  - [ ] Profile card appears smoothly

- [ ] Messages page:
  - [ ] On first load, **Expected:** Loading spinner shows
  - [ ] Conversations list loads
  - [ ] Conversation count shows

- [ ] Send message:
  - [ ] **Expected:** Send button shows "..." or disables while sending
  - [ ] After message sends, button returns to normal

### Visual Feedback
- [ ] Hover states on buttons (on desktop)
- [ ] Active/touch states on buttons (on mobile, use DevTools mobile view)
- [ ] Smooth transitions between pages
- [ ] No jarring flashes or refresh artifacts

### Console Errors
- [ ] **CRITICAL:** Open DevTools Console tab
- [ ] Perform all test cases above
- [ ] **Expected:** NO red error messages in console
- [ ] **Acceptable:** Yellow warnings are OK (React strict mode, etc.)

---

## Test Case 8: Multi-Account Interactions ✓

### Account A & B Exchange Multiple Messages
- [ ] Account A: Send 5-10 messages with varying lengths
- [ ] Account B: Send replies intermixed
- [ ] **Expected:**
  - [ ] All messages appear in both accounts' chats (within 2 sec)
  - [ ] Message order is correct (chronological)
  - [ ] Scrolling works smoothly
  - [ ] No duplicate messages

### Create New Match for Testing
- [ ] Logout both accounts
- [ ] Create Account C (carol@test.com) in new browser tab
- [ ] Account A: Like Account C
- [ ] Account C: Like Account A
- [ ] **Expected:** New match appears for both in Matches list

- [ ] Account B: Like Account C
- [ ] Account C: Like Account B
- [ ] **Expected:** Both Accounts B & C can message each other

---

## Test Case 9: Mobile-Specific Testing ✓

### Touch Interactions
- [ ] Use DevTools mobile view (375px width)
- [ ] Tap buttons:
  - [ ] Like/Pass buttons → Respond correctly
  - [ ] Send message → Button activates
  - [ ] Navigation links → Navigate correctly
- [ ] **Expected:** No "dead zones", all buttons tappable with thumb

### Landscape Mode (on actual mobile or DevTools)
- [ ] Rotate device/DevTools to landscape
- [ ] Test pages should reflow:
  - [ ] Discover card still visible, buttons accessible
  - [ ] Messages list still readable
  - [ ] Chat window still works

### Battery & Network
- [ ] Messages should continue working with:
  - [ ] Network throttled to slow 3G (DevTools)
  - [ ] Messages take 2-3 seconds to appear (polling interval)
  - [ ] No crashes or infinite loading

---

## Test Case 10: Preferences & Filtering ✓

### Set Preferences
- [ ] Account A: Go to Preferences
- [ ] Set min_age: 25, max_age: 40, interested_in: "all", distance: 50
- [ ] Save preferences
- [ ] **Expected:** Message confirms save or redirects to Discover

### Create Test Users with Different Ages
- [ ] Create Account C: age 24 (below min_age)
- [ ] Create Account D: age 42 (above max_age)
- [ ] Create Account E: age 30 (within range)
- [ ] Account A: Go to Discover
- [ ] **Expected:**
  - [ ] See Account E (age 30) ✓
  - [ ] DO NOT see Account C (age 24) ✓
  - [ ] DO NOT see Account D (age 42) ✓

---

## Test Case 11: Auth Session Management ✓

### Login Persistence
- [ ] Log in as Account A
- [ ] Close browser tab (not full browser)
- [ ] Open new tab, go to http://localhost:5176
- [ ] **Expected:** Still logged in, on Discover page

- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] **Expected:** Still logged in (token persisted in localStorage)

### Logout Flow
- [ ] If logout button exists:
  - [ ] Click logout
  - [ ] **Expected:** Redirected to login page
  - [ ] Cannot access /discover without logging in again

---

## Test Case 12: Error Recovery ✓

### After Network Disconnection
- [ ] Send a message while online
- [ ] Toggle Network offline in DevTools
- [ ] Try to send another message
- [ ] **Expected:** Error message appears
- [ ] Re-enable network
- [ ] Click retry (if button exists) or try sending again
- [ ] **Expected:** Message sends successfully

### Invalid Match ID
- [ ] Manually paste in URL: http://localhost:5176/messages/invalid-id
- [ ] **Expected:** Error message "Conversation not found" with "Back to Messages" button

---

## Summary Checklist

### Critical Features (Must Pass)
- [ ] Signup and login work
- [ ] Profile creation works
- [ ] Matching algorithm creates matches
- [ ] Real-time messaging sends/receives messages
- [ ] No console errors
- [ ] Responsive on mobile (375px)

### Important Features (Should Pass)
- [ ] Preferences save and filter
- [ ] Loading states show during data fetch
- [ ] Error messages are user-friendly
- [ ] Navigation works without errors
- [ ] Messages persist on refresh

### Nice-to-Have Features (Can Pass)
- [ ] Toast notifications for success/error
- [ ] Smooth animations and transitions
- [ ] Skeleton loaders while loading
- [ ] All DevTools mobile tests pass

---

## Bug Reporting Template

If you find a bug:
```
**Title:** [Feature] Description of bug
**Steps to Reproduce:**
1. Do X
2. Do Y
3. Do Z

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Screenshots/Console Errors:**
Any error messages or red console errors

**Environment:**
- Account: alice@test.com or bob@test.com
- Browser: Chrome/Firefox/Safari
- Device: Mobile/Desktop
- Network: Normal/Throttled
```

---

## Test Completion Status

When all tests pass, you're ready to deploy! ✅
