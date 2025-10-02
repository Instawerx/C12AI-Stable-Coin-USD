# 💧 C12DAO Token Icons

## 📁 Icon Files

This directory contains the official C12DAO token icons.

### Required Icon

**Filename:** `c12dao-icon.png`
**Description:** Blue-Pink Gradient Droplet in Circle
**Specifications:**
- Format: PNG with transparent background
- Dimensions: 256x256px (minimum)
- Color: Blue (#0066FF) to Pink (#FF00CC) gradient
- Design: Circular border with centered water droplet

### Icon Sizes

For different use cases, we support multiple sizes:

| Filename | Size | Use Case |
|----------|------|----------|
| `c12dao-icon.png` | 256x256 | Default, MetaMask, wallets |
| `c12dao-icon-512.png` | 512x512 | High-res displays, websites |
| `c12dao-icon-1024.png` | 1024x1024 | Marketing, print materials |
| `c12dao-icon.svg` | Vector | Scalable, professional use |

## 📥 How to Add Icons

### Step 1: Save the Icon

The C12DAO token icon (blue-pink gradient droplet) should be placed in this directory.

**Instructions:**
1. Download or save the official C12DAO icon image
2. Ensure it's a PNG with transparent background
3. Recommended size: 256x256px or larger
4. Save as: `c12dao-icon.png`

### Step 2: Create Multiple Sizes (Optional)

For better quality across platforms:

```bash
# Using ImageMagick (if installed)
magick c12dao-icon.png -resize 512x512 c12dao-icon-512.png
magick c12dao-icon.png -resize 1024x1024 c12dao-icon-1024.png
```

Or use online tools:
- https://www.iloveimg.com/resize-image
- https://www.imageresizer.com/

## 🎨 Icon Specifications

### Design Elements

**Shape:**
- Outer circular border (blue to pink gradient)
- Inner water droplet shape
- 3D gradient effect
- Clean, modern aesthetic

**Colors:**
- Primary Blue: `#0066FF`
- Purple Transition: `#8800FF`
- Pink Accent: `#FF00CC`
- White highlights for 3D effect

**Background:**
- Transparent (alpha channel)
- No solid background color

## 📱 Usage

### MetaMask

When adding C12DAO to MetaMask:
1. Import custom token
2. Enter address: `0x26F3d3c2C759acE462882864aa692FBa4512e38B`
3. Click "Edit" next to the token icon
4. Upload: `assets/icons/c12dao-icon.png`

### Websites/DApps

```html
<img src="assets/icons/c12dao-icon.png" alt="C12DAO Token" width="32" height="32" />
```

### React/JSX

```jsx
import c12daoIcon from './assets/icons/c12dao-icon.png';

<img src={c12daoIcon} alt="C12DAO" className="token-icon" />
```

## ⚠️ Important Notes

**DO:**
- ✅ Use the official icon for all C12DAO representations
- ✅ Maintain the blue-pink gradient color scheme
- ✅ Keep transparent background
- ✅ Use appropriate size for the platform

**DON'T:**
- ❌ Modify the colors or design
- ❌ Use C12USD icon for C12DAO token
- ❌ Add backgrounds or borders
- ❌ Stretch or distort the icon
- ❌ Use low-resolution versions

## 🔗 References

- **Branding Guide:** `../C12DAO_BRANDING_GUIDE.md`
- **DAO Documentation:** `../DAO_ROLES_AND_MANAGER.md`
- **Contract Address:** `0x26F3d3c2C759acE462882864aa692FBa4512e38B`
- **Polygonscan:** https://polygonscan.com/token/0x26F3d3c2C759acE462882864aa692FBa4512e38B

## 📝 Current Status

| Icon | Status | Notes |
|------|--------|-------|
| `c12dao-icon.png` | 🟡 Pending Upload | User needs to add the official icon |
| `c12dao-icon-512.png` | ⚪ Optional | High-res version |
| `c12dao-icon-1024.png` | ⚪ Optional | Extra high-res version |
| `c12dao-icon.svg` | ⚪ Optional | Vector version for scaling |

---

**To complete the branding setup:**
1. Save the C12DAO droplet icon as `c12dao-icon.png` in this directory
2. Ensure it's at least 256x256px
3. Verify transparent background
4. Test in MetaMask
5. Update status in this README

---

**Last Updated:** October 2, 2025
