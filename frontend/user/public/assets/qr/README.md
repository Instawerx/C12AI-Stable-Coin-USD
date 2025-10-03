# Cash App QR Code Setup

This directory contains the QR code for Cash App payments.

## Required File

**File name:** `cashapp-payment-qr.png`
**Location:** `public/assets/qr/cashapp-payment-qr.png`

## How to Get Your Cash App QR Code

### Method 1: From Cash App Mobile

1. Open Cash App on your phone
2. Tap your profile icon (top right)
3. Tap "Share $Cashtag" or "Request"
4. Tap the QR code icon
5. Screenshot or save the QR code
6. Transfer to this directory

### Method 2: Generate Online

1. Go to https://www.qr-code-generator.com/
2. Select "URL" or "Text"
3. Enter your Cash App link: `https://cash.app/$C12Ai`
4. Customize:
   - Size: 512x512 pixels (recommended)
   - Format: PNG
   - No frame (for better integration)
5. Download and save as `cashapp-payment-qr.png`

### Method 3: Use Cash App Web

1. Log into https://cash.app/account
2. Go to your profile
3. Right-click on your QR code and save image
4. Save as `cashapp-payment-qr.png`

## File Specifications

- **Format:** PNG
- **Recommended Size:** 512x512 pixels
- **Minimum Size:** 256x256 pixels
- **Maximum Size:** 1024x1024 pixels
- **Background:** Transparent or white
- **Margins:** Include quiet zone around QR code

## Verification

After adding the file, verify it works:

1. Open the Buy Tokens modal
2. Select Cash App payment method
3. Scroll to step 3 (QR Code section)
4. Verify the QR code displays correctly
5. Test scanning with Cash App mobile

## Fallback

If you don't add a QR code image, users will see:
- Text: "QR Code Here" placeholder
- Gray background
- Users can still use the Cash App link to pay

## Security Note

QR codes for payment should:
- ✅ Point to your official Cash App account only
- ✅ Be regularly verified for correctness
- ❌ Never point to third-party services
- ❌ Never include sensitive information

---

**Status:** ⏳ Waiting for QR code image

**Next Steps:**
1. Get QR code using one of the methods above
2. Save as `cashapp-payment-qr.png` in this directory
3. Verify in browser
4. Update status to ✅ Complete
