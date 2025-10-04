# Manual Payment System - Testing Guide

**Created:** October 3, 2025
**System Version:** 1.0
**Status:** Ready for Testing

---

## 📋 Table of Contents

1. [Pre-Testing Checklist](#pre-testing-checklist)
2. [User Flow Testing](#user-flow-testing)
3. [Admin Flow Testing](#admin-flow-testing)
4. [Edge Cases & Error Handling](#edge-cases--error-handling)
5. [Integration Testing](#integration-testing)
6. [Performance Testing](#performance-testing)

---

## ✅ Pre-Testing Checklist

### Database Setup
- [ ] Database migration completed: `npx prisma migrate dev --name add_manual_payment_system`
- [ ] Pricing data seeded: `npm run seed`
- [ ] Verify `manual_payments` table exists in database
- [ ] Verify `system_config` has 8 pricing entries

### Firebase Functions
- [ ] Functions built: `cd functions && npm run build`
- [ ] Functions deployed: `firebase deploy --only functions:manualPayments`
- [ ] Test functions endpoint: `https://YOUR_PROJECT.cloudfunctions.net/manualPayments-createManualPayment`

### Frontend Setup
- [ ] User frontend running: `cd frontend/user && npm run dev` (port 3001)
- [ ] Admin frontend running: `cd frontend && npm run dev` (port 3000)
- [ ] QR code added: `frontend/user/public/assets/qr/cashapp-payment-qr.png`

### Test Accounts
- [ ] Regular user account created
- [ ] Admin account with FINANCE_ADMIN role
- [ ] Admin account with SUPER_ADMIN role

---

## 🧪 User Flow Testing

### Test 1: Access Buy Tokens Modal

**Steps:**
1. Log in as regular user
2. Navigate to Dashboard (`/app/dashboard`)
3. Look for "Buy Tokens" button in Quick Actions section
4. Click "Buy Tokens"

**Expected Results:**
- ✅ Modal opens with 3-step progress indicator
- ✅ Step 1: "Select Token" is active
- ✅ Modal displays C12USD and C12DAO options

**Pass/Fail:** ___________

---

### Test 2: C12USD Purchase - Cash App

**Steps:**
1. Open Buy Tokens modal
2. Select **C12USD**
3. Enter amount: `$100`
4. Click "Continue"
5. Select **Cash App** payment method
6. Click "Continue"
7. Verify payment instructions displayed
8. Note the Reference ID
9. Upload a screenshot (or use mock file)
10. Enter your cashtag (e.g., `$testuser`)
11. Click "Submit Payment Proof"

**Expected Results:**
- ✅ Preview shows: 100 C12USD for $100.00
- ✅ Payment instructions show $C12Ai cashtag
- ✅ QR code displays (if added)
- ✅ Reference ID is unique (format: MP-YYYY-XXXXX)
- ✅ Screenshot upload field appears
- ✅ Success message appears after submission
- ✅ Firebase function `createManualPayment` is called
- ✅ Firebase function `submitPaymentProof` is called

**Pass/Fail:** ___________

---

### Test 3: C12DAO Purchase - Stablecoin

**Steps:**
1. Open Buy Tokens modal
2. Select **C12DAO**
3. Enter amount: `$33` (10 tokens)
4. Click "Continue"
5. Select **Stablecoin** payment method
6. Select **USDT** stablecoin
7. Select **BSC** blockchain
8. Click "Continue"
9. Verify payment instructions
10. Copy admin wallet address
11. Enter TX hash: `0x1234567890abcdef...` (mock)
12. Enter sender address: `0xYourWalletAddress...`
13. Click "Submit Payment Proof"

**Expected Results:**
- ✅ Preview shows: 10 C12DAO for $33.00
- ✅ Admin wallet address displays: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`
- ✅ Copy button works
- ✅ TX hash and sender address required
- ✅ Success message after submission
- ✅ Payment created with status PENDING_VERIFICATION

**Pass/Fail:** ___________

---

### Test 4: Amount Validation

**Test Cases:**

| Amount | Expected Result | Pass/Fail |
|--------|----------------|-----------|
| $5 | Error: Minimum $10 | ___ |
| $10 | Accepted | ___ |
| $100 | Accepted | ___ |
| $50,000 | Accepted | ___ |
| $50,001 | Error: Maximum $50,000 | ___ |
| -$50 | Error: Invalid amount | ___ |
| abc | Error: Invalid input | ___ |

**Pass/Fail:** ___________

---

### Test 5: Modal Navigation

**Steps:**
1. Open modal
2. Proceed to step 2
3. Click "Back" button
4. Verify returned to step 1
5. Proceed to step 3
6. Click "Back" button twice
7. Verify returned to step 1
8. Click close (X) button

**Expected Results:**
- ✅ Back navigation works correctly
- ✅ Data persists when going back
- ✅ Modal closes when clicking X
- ✅ Modal can be reopened

**Pass/Fail:** ___________

---

## 👨‍💼 Admin Flow Testing

### Test 6: Admin Access Control

**Steps:**
1. Log out
2. Log in as regular user (no admin role)
3. Navigate to `/admin/payments`
4. Log out
5. Log in as FINANCE_ADMIN user
6. Navigate to `/admin/payments`

**Expected Results:**
- ✅ Regular user redirected to home
- ✅ "Access Denied" message shown
- ✅ Admin user can access page
- ✅ Admin badge visible

**Pass/Fail:** ___________

---

### Test 7: Payment Queue View

**Steps:**
1. Log in as admin
2. Navigate to `/admin/payments`
3. Verify "Payment Queue" tab is active
4. Check statistics cards
5. View payment list

**Expected Results:**
- ✅ Queue stats show correct counts (Pending, Approved, Rejected, Total Volume)
- ✅ Payment list displays recent submissions
- ✅ Each payment shows: Reference ID, User, Purchase details, Status badge
- ✅ Review button appears for PENDING_VERIFICATION payments

**Pass/Fail:** ___________

---

### Test 8: Payment Filtering

**Steps:**
1. On Payment Queue page
2. Click "PENDING_VERIFICATION" filter
3. Verify only pending payments shown
4. Click "ALL" filter
5. Use search box: Enter reference ID
6. Verify filtered results
7. Clear search
8. Click "Refresh" button

**Expected Results:**
- ✅ Filters work correctly
- ✅ Search finds payments by Reference ID, email, or name
- ✅ Refresh button reloads data
- ✅ No results message shows when appropriate

**Pass/Fail:** ___________

---

### Test 9: Review & Approve Payment (Cash App)

**Steps:**
1. Find a PENDING_VERIFICATION Cash App payment
2. Click "Review" button
3. Review all payment details
4. Click "View Screenshot" link
5. Verify payment proof opens
6. Enter admin notes: "Payment verified - correct amount and cashtag"
7. Click "Approve & Distribute"

**Expected Results:**
- ✅ Modal opens with full payment details
- ✅ User information displayed
- ✅ Cash App cashtag shown
- ✅ Screenshot link opens in new tab
- ✅ Admin notes field accepts input
- ✅ Approve button calls Firebase function
- ✅ Success message shown
- ✅ Modal closes
- ✅ Payment status updates to APPROVED
- ✅ Tokens distributed to user wallet

**Pass/Fail:** ___________

---

### Test 10: Review & Approve Payment (Stablecoin)

**Steps:**
1. Find a PENDING_VERIFICATION Stablecoin payment
2. Click "Review"
3. Copy sender address to clipboard
4. Copy TX hash to clipboard
5. Click "View on Explorer" button
6. Verify transaction details
7. Enter admin notes: "Transaction confirmed on BSCScan"
8. Click "Approve & Distribute"

**Expected Results:**
- ✅ Stablecoin details displayed (type, sender, TX hash, blockchain)
- ✅ Copy buttons work
- ✅ Blockchain explorer opens (BSCScan or PolygonScan)
- ✅ Payment approved successfully
- ✅ Tokens distributed

**Pass/Fail:** ___________

---

### Test 11: Reject Payment

**Steps:**
1. Find a PENDING_VERIFICATION payment
2. Click "Review"
3. Try to click "Reject Payment" without admin notes
4. Verify error appears
5. Enter admin notes: "Invalid screenshot - amount mismatch"
6. Click "Reject Payment"

**Expected Results:**
- ✅ Rejection requires admin notes
- ✅ Error message shown if notes empty
- ✅ Rejection successful with notes
- ✅ Payment status updates to REJECTED
- ✅ User receives notification
- ✅ No tokens distributed

**Pass/Fail:** ___________

---

### Test 12: Analytics Dashboard

**Steps:**
1. Click "Analytics" tab
2. Review key metrics
3. Change time range filter to "7D"
4. Change to "30D"
5. Review charts

**Expected Results:**
- ✅ Key metrics display: Total Volume, Transactions, Conversion Rate, Avg Processing Time
- ✅ Time range filter works
- ✅ Top Tokens chart shows C12USD vs C12DAO breakdown
- ✅ Payment Methods chart shows Cash App vs Stablecoin
- ✅ Recent Activity timeline displayed
- ✅ Status breakdown cards shown

**Pass/Fail:** ___________

---

## ⚠️ Edge Cases & Error Handling

### Test 13: Payment Expiry

**Steps:**
1. Create a payment
2. Manually update `expiresAt` in database to past date
3. Try to submit payment proof

**Expected Results:**
- ✅ Error message: "Payment submission expired"
- ✅ Status updates to EXPIRED

**Pass/Fail:** ___________

---

### Test 14: Duplicate Submission

**Steps:**
1. Submit payment proof
2. Try to submit again for same payment

**Expected Results:**
- ✅ Error: Payment already submitted or in another state
- ✅ No duplicate entry created

**Pass/Fail:** ___________

---

### Test 15: Network Errors

**Steps:**
1. Disconnect internet
2. Try to submit payment
3. Reconnect
4. Retry submission

**Expected Results:**
- ✅ Error message shown
- ✅ Loading state stops
- ✅ Retry works after reconnection

**Pass/Fail:** ___________

---

### Test 16: Unauthorized Access

**Steps:**
1. As User A, create payment
2. Note the payment ID
3. Log in as User B
4. Try to access User A's payment via API

**Expected Results:**
- ✅ Permission denied error
- ✅ User can only access own payments

**Pass/Fail:** ___________

---

## 🔗 Integration Testing

### Test 17: Firebase Functions Integration

**Firebase Functions to Test:**

| Function | Test | Expected Result | Pass/Fail |
|----------|------|-----------------|-----------|
| `createManualPayment` | Create new payment | Payment record in DB | ___ |
| `submitPaymentProof` | Submit proof | Status → PENDING_VERIFICATION | ___ |
| `verifyManualPayment` (approve) | Admin approves | Tokens distributed | ___ |
| `verifyManualPayment` (reject) | Admin rejects | No tokens, user notified | ___ |
| `getManualPayment` | Get payment details | Correct data returned | ___ |

**Pass/Fail:** ___________

---

### Test 18: Notification System

**Steps:**
1. Create payment → Check for notification
2. Submit proof → Check for notification
3. Admin approves → Check for notification
4. Admin rejects → Check for notification

**Expected Results:**
- ✅ User receives notification at each step
- ✅ Notifications contain correct information

**Pass/Fail:** ___________

---

### Test 19: Audit Logging

**Steps:**
1. Perform several actions (create, submit, approve, reject)
2. Check audit logs in database

**Expected Results:**
- ✅ All actions logged with timestamps
- ✅ User IDs captured
- ✅ Old and new data recorded

**Pass/Fail:** ___________

---

## ⚡ Performance Testing

### Test 20: Load Testing

**Steps:**
1. Create 100+ mock payments in database
2. Load admin queue page
3. Test filtering performance
4. Test search performance

**Expected Results:**
- ✅ Page loads in < 2 seconds
- ✅ Filtering is instant
- ✅ Search returns results quickly
- ✅ No UI lag

**Pass/Fail:** ___________

---

### Test 21: Concurrent Approvals

**Steps:**
1. Open 2 admin sessions in different browsers
2. Both admins try to approve same payment simultaneously

**Expected Results:**
- ✅ Only one approval succeeds
- ✅ Second approval gets error
- ✅ No duplicate token distribution

**Pass/Fail:** ___________

---

## 📊 Test Summary

**Total Tests:** 21
**Passed:** ___
**Failed:** ___
**Skipped:** ___

**Overall Status:** ___________

---

## 🐛 Issues Found

| Test # | Issue Description | Severity | Status |
|--------|------------------|----------|--------|
| | | | |
| | | | |

---

## ✅ Sign-Off

**Tested By:** ___________________
**Date:** ___________________
**Ready for Production:** ☐ Yes  ☐ No

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________
