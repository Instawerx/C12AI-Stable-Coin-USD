# Admin Dashboard Guide - Manual Payment Management

## Overview

The Admin Dashboard provides a comprehensive interface for managing manual token purchases. Finance admins and super admins can review payment submissions, verify payment proofs, approve or reject requests, and monitor payment analytics.

**Access**: `/admin/payments`

**Required Roles**: `SUPER_ADMIN` or `FINANCE_ADMIN`

---

## Features

### 1. Payment Queue

The payment queue displays all manual payment requests with powerful filtering and search capabilities.

#### Key Features:
- **Real-time Updates**: Click "Refresh" to fetch latest payments
- **Status Filtering**: Filter by pending, verifying, approved, completed, or rejected
- **Search**: Search by reference ID, email, or wallet address
- **Priority Indicators**: Color-coded borders indicate urgency
  - 🔴 Red: <2 hours until expiry
  - 🟡 Yellow: 2-6 hours until expiry
  - 🔵 Blue: >6 hours until expiry
- **Quick Stats**: View total, pending, verifying, completed payments and total value

#### Payment Card Information:
Each payment card displays:
- **Reference ID**: Unique identifier (format: C12-XXXXXX)
- **Status Badge**: Current payment status with icon
- **Time Created**: Relative time (e.g., "2h ago")
- **User Email**: User's email address
- **Amount**: USD amount and token quantity
- **Chain**: Delivery blockchain (BSC/Polygon)
- **Payment Method**: Cash App or Stablecoin type
- **Expiry Countdown**: Time remaining until submission expires
- **Delivery Address**: User's wallet address
- **Review Button**: Opens payment review modal

---

### 2. Payment Review Modal

Click "Review" on any pending payment to open the detailed review interface.

#### User Information Section:
- **User ID**: Firebase user ID (copyable)
- **Email**: User's email address
- **Delivery Address**: Wallet address where tokens will be sent (copyable)

#### Purchase Details Section:
- **Token Type**: C12USD or C12DAO with icon
- **Amount (USD)**: Total USD value
- **Token Amount**: Calculated token quantity
- **Delivery Chain**: BSC or Polygon

#### Payment Proof Section:

**For Cash App Payments:**
- Screenshot of Cash App payment
- Click to enlarge or open in new tab
- Verification checklist:
  - ✅ Payment sent to **$C12Ai**
  - ✅ Amount matches **$XX.XX**
  - ✅ Screenshot shows completed transaction
  - ✅ Timestamp within 24 hours of request

**For Stablecoin Payments:**
- Transaction hash (copyable)
- Stablecoin type (BUSD/USDT/USDC)
- "View on Block Explorer" button
- Verification checklist:
  - ✅ Sent to admin wallet (0x7903...390b)
  - ✅ Token type matches
  - ✅ Amount matches
  - ✅ Chain matches
  - ✅ Transaction confirmed on blockchain

#### Actions:

**Approve & Distribute Tokens:**
- Validates payment proof
- Sets status to APPROVED
- Triggers automatic token distribution
- For C12USD: Creates mint receipt
- For C12DAO: Transfers from treasury
- Notifies user of completion
- Records distribution TX hash

**Reject Payment:**
1. Click "Reject Payment"
2. Enter rejection reason (required)
3. Click "Confirm Rejection"
4. User receives email with reason
5. Payment marked as REJECTED

**Copy Helpers:**
- Click copy icon next to user ID, wallet address, or TX hash
- Green checkmark confirms successful copy

**Expiry Warnings:**
- Red warning if payment expired
- Expired payments cannot be approved

---

### 3. Analytics Dashboard

Switch to the Analytics tab to view comprehensive payment metrics and insights.

#### Time Range Selector:
- **Last 7 Days**: Recent activity snapshot
- **Last 30 Days**: Monthly performance (default)
- **Last 90 Days**: Quarterly trends
- **All Time**: Complete historical data

#### Key Metrics Cards:

**Total Volume:**
- Total USD value of all payments
- Total payment count
- Green dollar icon

**Completed:**
- Completed payment volume
- Number of completed payments
- Conversion rate percentage
- Green checkmark icon

**Pending Review:**
- Number of pending payments
- Total pending value
- Yellow clock icon

**Average Payment:**
- Average USD amount per payment
- Average verification time in hours
- Blue users icon

#### Token Breakdown:
- C12USD vs C12DAO distribution
- Visual progress bars
- Percentage of total payments
- Total volume per token

#### Payment Method Breakdown:
- Cash App vs Stablecoin split
- Visual progress bars
- Percentage breakdown
- Volume per method

#### Daily Activity Chart:
- Last 14 days activity
- Bar chart showing:
  - Green: Completed volume
  - Yellow: Pending/rejected volume
- Payment count per day
- Success rate percentage
- Hover for detailed stats

#### Performance Metrics:

**Conversion Rate:**
- Percentage of approved payments
- Completed vs total count

**Average Processing Time:**
- Hours from submission to completion
- Helps identify bottlenecks

**Rejection Rate:**
- Percentage of rejected payments
- Total rejection count

---

## Admin Workflows

### Daily Admin Checklist:

1. **Login to Admin Dashboard**
   - Navigate to `/admin/payments`
   - Verify admin role access

2. **Check Pending Queue**
   - Set filter to "Pending Verification"
   - Sort by priority (red borders first)
   - Note total pending count

3. **Review Each Payment**
   - Click "Review" on pending payments
   - Verify payment proof carefully
   - Cross-check amounts and addresses

4. **For Cash App Payments:**
   - Open screenshot in full size
   - Verify cashtag is **$C12Ai**
   - Confirm amount matches exactly
   - Check timestamp is recent
   - Look for signs of tampering

5. **For Stablecoin Payments:**
   - Copy TX hash
   - Click "View on Block Explorer"
   - Verify:
     - From address (sender)
     - To address (0x7903...390b)
     - Token contract (BUSD/USDT/USDC)
     - Amount (should match request)
     - Confirmations (at least 12)

6. **Make Decision:**
   - **If Valid**: Click "Approve & Distribute Tokens"
   - **If Invalid**: Click "Reject Payment" and provide reason

7. **Monitor Analytics**
   - Check daily volume trends
   - Review conversion rate (target: >90%)
   - Monitor average processing time (target: <24h)
   - Investigate high rejection rates

8. **End of Day Review**
   - Ensure no pending payments >20 hours old
   - Review analytics for anomalies
   - Check for any support tickets

---

## Common Rejection Reasons

Use clear, helpful rejection reasons:

### Cash App:
- ❌ "Screenshot does not show payment to $C12Ai. Please verify and resubmit."
- ❌ "Amount in screenshot ($XX.XX) does not match requested amount ($YY.YY)."
- ❌ "Screenshot appears to be edited or tampered with. Original receipt required."
- ❌ "Payment timestamp is older than 24 hours from request creation."
- ❌ "Screenshot quality too poor to verify details. Please submit clearer image."

### Stablecoin:
- ❌ "Transaction not found on blockchain. Please verify TX hash."
- ❌ "Transaction sent to incorrect address. Must be sent to 0x7903c63CB9f42284d03BC2a124474760f9C1390b."
- ❌ "Incorrect token sent. Request was for BUSD but USDT was sent."
- ❌ "Amount mismatch: XX BUSD sent but YY BUSD required."
- ❌ "Transaction has insufficient confirmations. Please wait for blockchain confirmation."
- ❌ "Transaction failed on blockchain. Funds not received."

---

## Troubleshooting

### Issue: Cannot Access Admin Dashboard

**Symptoms**: Redirected to home page or "Access Denied" message

**Solutions**:
1. Verify your Firebase Auth custom claims:
   ```javascript
   // In Firebase Console > Authentication > Users > User Actions
   // Check "Custom claims" field shows: { "adminRole": "SUPER_ADMIN" }
   ```

2. Check AdminRole in database:
   ```sql
   SELECT u.email, ar.role, ar.is_active
   FROM users u
   JOIN admin_roles ar ON u.id = ar.user_id
   WHERE u.email = 'your@email.com';
   ```

3. Ensure role is active (`is_active = true`)

4. Clear browser cache and re-login

---

### Issue: Payment Queue Not Loading

**Symptoms**: Spinning loader forever or "Failed to load payments" error

**Solutions**:
1. Check browser console for errors
2. Verify Firebase Functions are deployed:
   ```bash
   firebase functions:list | grep manualPayments
   ```
3. Check Firebase Functions logs:
   ```bash
   firebase functions:log --only manualPayments-listPayments
   ```
4. Verify network connection
5. Try manual refresh

---

### Issue: Analytics Not Calculating Correctly

**Symptoms**: Metrics show 0 or incorrect values

**Solutions**:
1. Check time range selector (may be filtering out all data)
2. Verify payments exist in database:
   ```sql
   SELECT COUNT(*) FROM manual_payment;
   ```
3. Check Firebase Functions logs for analytics errors
4. Try different time range
5. Hard refresh browser (Ctrl+Shift+R)

---

### Issue: Approve Button Doesn't Work

**Symptoms**: Clicking approve does nothing or shows error

**Solutions**:
1. Check if payment is expired (cannot approve expired payments)
2. Verify sufficient tokens in treasury (for C12DAO)
3. Check Firebase Functions logs:
   ```bash
   firebase functions:log --only manualPayments-verifyManualPayment
   ```
4. Ensure blockchain RPC endpoint is responsive
5. Try again in a few minutes (may be temporary network issue)

---

### Issue: Distribution Taking Too Long

**Symptoms**: Payment stuck in "DISTRIBUTING" status

**Solutions**:
1. Check blockchain network status (BSCScan/PolygonScan)
2. Verify gas prices aren't extremely high
3. Check Firebase Functions logs for errors
4. Wait 5-10 minutes for blockchain confirmation
5. If still stuck after 30 minutes, contact technical support

---

## Security Best Practices

### Payment Verification:

1. **Never rush approvals** - Take time to verify each payment proof
2. **Double-check amounts** - Ensure exact match between proof and request
3. **Verify addresses** - Confirm all payments to correct wallets
4. **Watch for patterns** - Multiple similar requests from same user may be suspicious
5. **Check timestamps** - Ensure proofs are recent and match request timing

### Screenshot Fraud Detection:

Look for signs of tampering:
- Misaligned text or numbers
- Different fonts or colors
- Pixelation around edited areas
- Inconsistent shadows or lighting
- Wrong aspect ratio for Cash App UI
- Unusual formatting or layout
- Metadata inconsistencies

### Blockchain Verification:

Always verify stablecoin payments on blockchain explorer:
- Transaction must be confirmed (12+ confirmations recommended)
- Exact amount must match request
- Correct token contract
- Sent to correct admin wallet
- No reverted/failed transaction status

### Account Security:

1. **Never share admin credentials**
2. **Use strong, unique passwords**
3. **Enable 2FA on Firebase account**
4. **Log out when leaving workstation**
5. **Report suspicious activity immediately**
6. **Review audit logs regularly**

---

## Performance Targets

### Key Performance Indicators (KPIs):

| Metric | Target | Action Required If |
|--------|--------|-------------------|
| Conversion Rate | >90% | <80%: Review rejection reasons |
| Avg Processing Time | <24 hours | >36h: Increase admin availability |
| Pending Queue Size | <20 payments | >50: Assign more admins |
| Rejection Rate | <10% | >20%: Improve user instructions |
| Daily Volume | Track trend | Sudden spike: Investigate |

### Recommended Admin Staffing:

- **0-10 payments/day**: 1 admin, check twice daily
- **10-50 payments/day**: 2 admins, check every 4 hours
- **50-100 payments/day**: 3 admins, continuous coverage
- **100+ payments/day**: 4+ admins, shift-based coverage

---

## Support Escalation

### When to Escalate:

Escalate to technical support if:
- ❗ Blockchain distribution failing repeatedly
- ❗ Firebase Functions throwing errors
- ❗ Database inconsistencies detected
- ❗ Suspected fraud or security breach
- ❗ System performance degradation
- ❗ Payment stuck >1 hour in any status

### Escalation Contacts:
- **Technical Issues**: dev@c12.ai
- **Suspected Fraud**: security@c12.ai
- **Urgent Issues**: admin@c12.ai (24/7)

---

## Changelog

### October 2, 2025 - Initial Release
- ✅ Payment queue with filtering and search
- ✅ Payment review modal with proof verification
- ✅ Analytics dashboard with metrics and charts
- ✅ Admin role-based access control
- ✅ Real-time data refresh
- ✅ Liquid Glass UI design

---

## FAQ

**Q: How often should I check the admin dashboard?**
A: During business hours, check at least every 4 hours. Aim to process payments within 24 hours of submission.

**Q: What if I'm unsure about approving a payment?**
A: When in doubt, ask for help. Flag suspicious payments and consult with another admin or technical support.

**Q: Can I approve payments outside the 24-hour window?**
A: No, expired payments cannot be approved. User must submit a new request.

**Q: What happens after I approve a payment?**
A: The system automatically distributes tokens to the user's wallet and sends confirmation. Monitor the status to ensure completion.

**Q: How do I know if token distribution succeeded?**
A: Check the payment status changes to "COMPLETED" and a distribution TX hash is recorded. You can verify on blockchain explorer.

**Q: Can I undo an approval or rejection?**
A: No, decisions are final. Once approved, tokens are distributed. Contact technical support if you made an error.

**Q: What if the blockchain transaction fails?**
A: Payment will remain in "DISTRIBUTING" status. Check Firebase logs and contact technical support to investigate.

---

**Last Updated**: October 2, 2025
**Version**: 1.0.0
