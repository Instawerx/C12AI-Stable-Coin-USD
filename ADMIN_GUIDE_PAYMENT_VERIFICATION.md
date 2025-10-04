# Admin Guide: Payment Verification & Management

**Last Updated:** October 3, 2025
**Version:** 1.0
**For:** FINANCE_ADMIN & SUPER_ADMIN roles

---

## 🎯 Overview

This guide covers the manual payment verification process for C12USD and C12DAO token purchases. As a finance admin, you are responsible for reviewing payment proofs and approving or rejecting purchase requests.

---

## 🔐 Access Requirements

### Required Role
- **FINANCE_ADMIN** - Can verify payments
- **SUPER_ADMIN** - Full access to all admin functions

### Accessing the Admin Panel
1. Log in with your admin account
2. Navigate to: `/admin/payments`
3. You should see the Payment Management dashboard

### If Access is Denied
- Verify your account has the correct role in Firebase Authentication custom claims
- Contact a SUPER_ADMIN to grant you FINANCE_ADMIN privileges

---

## 📊 Dashboard Overview

### Two Main Tabs

#### 1. Payment Queue
- Real-time list of all payment requests
- Filter by status
- Search functionality
- Review and approve/reject payments

#### 2. Analytics
- Key performance metrics
- Volume statistics
- Approval rates
- Payment method breakdowns

---

## 🔍 Payment Queue

### Queue Statistics (Top Cards)

| Metric | Description |
|--------|-------------|
| **Pending** | Payments awaiting your review |
| **Approved** | Successfully verified payments |
| **Rejected** | Payments that failed verification |
| **Total Volume** | Sum of all payment amounts |

### Status Filters

- **ALL** - Show all payments
- **PENDING_VERIFICATION** - Needs your review (priority)
- **APPROVED** - Already approved
- **REJECTED** - Already rejected
- **EXPIRED** - Submission deadline passed

**💡 Tip:** Start by filtering to PENDING_VERIFICATION to see what needs attention.

---

## ✅ Verifying Cash App Payments

### Step-by-Step Process

#### 1. Click "Review" on Payment

Find a payment with status PENDING_VERIFICATION and click the **Review** button.

#### 2. Review Payment Details

Verify the following information:

**User Information**
- Name
- Email
- User ID

**Token Details**
- Token type (C12USD or C12DAO)
- Token amount
- Delivery chain (BSC or Polygon)

**Payment Information**
- Payment method: Cash App
- Payment amount (USD)
- Sender's cashtag

#### 3. Verify Payment Proof

1. Click **"View Screenshot"** to open the proof image
2. Check the screenshot shows:
   - ✅ Payment sent to **$C12Ai** (our official cashtag)
   - ✅ **Correct amount** matches the payment request
   - ✅ Sender's cashtag matches what they entered
   - ✅ Recent date/time (within 24 hours of submission)
   - ✅ Clear, unedited image

#### 4. Cross-Reference in Cash App

1. Open Cash App on your phone or web
2. Check your transaction history
3. Find the matching payment by:
   - Amount
   - Sender's cashtag
   - Date/time

#### 5. Make a Decision

**If everything checks out:**
- Enter admin notes: "Payment verified - $100 received from $johndoe on [date]"
- Click **"Approve & Distribute"**
- Tokens will be automatically sent to the user's wallet

**If there's an issue:**
- Enter admin notes explaining the problem (REQUIRED)
  - Example: "Screenshot shows payment to wrong cashtag"
  - Example: "Amount mismatch - sent $50 but requested $100"
- Click **"Reject Payment"**
- User will be notified with your reason

---

## 💰 Verifying Stablecoin Payments

### Step-by-Step Process

#### 1. Click "Review" on Payment

Same as Cash App.

#### 2. Review Payment Details

Additional stablecoin-specific fields:
- Stablecoin type (USDT, USDC, or BUSD)
- Sender wallet address
- Transaction hash (TX Hash)
- Blockchain network (BSC or Polygon)

#### 3. Verify on Blockchain

1. Copy the Transaction Hash
2. Click **"View on Explorer"** button
   - Opens BSCScan (for BSC) or PolygonScan (for Polygon)

3. On the blockchain explorer, verify:
   - ✅ **Status:** Success (confirmed)
   - ✅ **To:** Our admin wallet `0x7903c63CB9f42284d03BC2a124474760f9C1390b`
   - ✅ **Value:** Correct stablecoin amount
   - ✅ **Token:** Correct stablecoin (USDT/USDC/BUSD)
   - ✅ **From:** Matches the sender address user provided
   - ✅ **Age:** Recent (within 24 hours of submission)

4. Check transaction has sufficient confirmations:
   - BSC: At least 15 confirmations
   - Polygon: At least 30 confirmations

#### 4. Make a Decision

**If verified:**
- Admin notes: "TX verified on BSCScan - 100 USDT received from 0x1234...5678"
- Click **"Approve & Distribute"**

**If issues found:**
- Admin notes with specific problem
  - Example: "TX hash not found on BSCScan"
  - Example: "Transaction sent to wrong wallet address"
  - Example: "Amount incorrect - sent 50 USDT instead of 100"
- Click **"Reject Payment"**

---

## ⚠️ Common Red Flags

### Cash App Payments

| Red Flag | Action |
|----------|--------|
| Screenshot is blurry/edited | Reject - request clearer proof |
| Payment to wrong cashtag | Reject - wrong recipient |
| Amount doesn't match | Reject - amount mismatch |
| Payment older than 7 days | Contact user for confirmation |
| Duplicate screenshot | Check if already processed |

### Stablecoin Payments

| Red Flag | Action |
|----------|--------|
| TX hash not found | Reject - invalid hash |
| Wrong network (e.g., ETH instead of BSC) | Reject - funds not received |
| Wrong token sent | Reject - wrong token type |
| Transaction failed/reverted | Reject - transaction failed |
| Insufficient amount | Reject - partial payment |
| Different sender address | Investigate - possible fraud |

---

## 📝 Best Practices

### Admin Notes
- Always provide clear, specific notes
- Include verification method used
- Note any unusual circumstances
- Be professional - users will see rejection reasons

### Response Time
- Aim to review payments within 24 hours
- Pending payments show up in yellow (⚠️)
- Prioritize high-value transactions

### Security
- Never approve without proper verification
- When in doubt, ask for additional proof
- Report suspicious activity to SUPER_ADMIN
- Never share admin credentials

### Communication
- Rejection notes should be helpful, not punitive
- Suggest what user needs to do to resubmit
- For complex issues, escalate to SUPER_ADMIN

---

## 🔄 After Approval

### What Happens Automatically

1. **Payment status** updates to `APPROVED`
2. **Tokens are minted/transferred:**
   - C12USD: New tokens minted to user's wallet
   - C12DAO: Tokens transferred from treasury

3. **User receives notification:**
   - Email notification
   - In-app notification
   - Push notification (if enabled)

4. **Audit log** created with your admin ID and action

5. **Analytics** updated in real-time

### Verifying Token Distribution

1. Go to Analytics tab
2. Check that Approved count increased
3. Check Total Volume increased
4. You can also verify on blockchain explorer using user's wallet address

---

## 📈 Using Analytics

### Key Metrics to Monitor

**Total Volume**
- Track daily/weekly revenue
- Identify trends
- Report to management

**Approval Rate**
- Target: Above 90%
- If below 90%, investigate common rejection reasons

**Average Processing Time**
- Target: Under 4 hours
- Monitor your team's response speed

**Top Tokens**
- C12USD usually higher volume
- C12DAO indicates DAO interest

**Payment Methods**
- Track Cash App vs Stablecoin preferences
- Identify which method is easier to verify

### Time Range Filters

- **7D** - Weekly performance
- **30D** - Monthly trends
- **90D** - Quarterly reports
- **All Time** - Historical data

---

## 🆘 Troubleshooting

### Issue: Can't approve payment

**Possible causes:**
1. Payment already processed by another admin
2. Payment expired
3. Network error

**Solution:**
- Refresh the page
- Check payment status
- Verify your admin role is active

### Issue: Token distribution failed

**What to do:**
1. Note the payment Reference ID
2. Check admin notes for error message
3. Contact technical team
4. Do NOT approve again (risk of double-distribution)

### Issue: User claims payment not received

**Verification steps:**
1. Check payment status is `TOKENS_DISTRIBUTED`
2. Verify transaction hash for token transfer
3. Confirm user is checking correct wallet
4. Confirm user is on correct blockchain (BSC vs Polygon)

---

## 🚨 Escalation Procedures

### When to Escalate to SUPER_ADMIN

- Suspicious activity or fraud suspected
- Payment amount over $10,000
- Technical errors preventing approval
- User disputes after rejection
- Repeated failed distribution attempts

### How to Escalate

1. Add detailed admin notes to the payment
2. Contact SUPER_ADMIN via:
   - Slack/Discord admin channel
   - Email with Reference ID in subject
3. Do NOT approve or reject until reviewed

---

## 📞 Admin Support Contacts

- **Technical Issues:** dev-team@c12usd.com
- **Fraud/Security:** security@c12usd.com
- **SUPER_ADMIN:** admin@c12usd.com
- **Emergency:** [Phone number]

---

## ✅ Quick Reference Checklist

### Before Approving

- [ ] User information verified
- [ ] Payment method confirmed
- [ ] Payment proof reviewed
- [ ] Amount matches request
- [ ] For Cash App: Screenshot shows payment to $C12Ai
- [ ] For Stablecoin: Transaction confirmed on blockchain
- [ ] Admin notes added
- [ ] No red flags detected

### Before Rejecting

- [ ] Issue clearly identified
- [ ] Detailed admin notes written
- [ ] Rejection reason is actionable for user
- [ ] User will understand what to fix

---

## 📊 Performance Goals

| Metric | Target | Notes |
|--------|--------|-------|
| Response Time | < 4 hours | For pending payments |
| Approval Rate | > 90% | Valid submissions |
| Error Rate | < 1% | Wrong approvals/rejections |
| Daily Reviews | Varies | Clear queue daily |

---

**Remember:** You are the guardian of C12USD's financial integrity. Every approval should be made with confidence and proper verification. When in doubt, ask for help! 🛡️
