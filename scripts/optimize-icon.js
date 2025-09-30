/**
 * Script to optimize and resize token icon for wallet compatibility
 *
 * Requirements:
 * - Install Sharp: npm install sharp
 *
 * Generates:
 * - 256x256 (standard for Trust Wallet, MetaMask)
 * - 128x128 (medium size)
 * - 64x64 (small size)
 * - 32x32 (favicon size)
 *
 * All optimized to < 100KB per file
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { size: 256, name: 'c12usd-256.png', quality: 90 },
  { size: 128, name: 'c12usd-128.png', quality: 90 },
  { size: 64, name: 'c12usd-64.png', quality: 90 },
  { size: 32, name: 'c12usd-32.png', quality: 90 },
  { size: 512, name: 'c12usd-512.png', quality: 85 },
];

const inputPath = path.join(__dirname, '../assets/icons/c12usd-original.png');
const outputDir = path.join(__dirname, '../assets/icons');

async function optimizeIcon() {
  console.log('🎨 C12USD Icon Optimization\n');
  console.log('=' .repeat(60));

  if (!fs.existsSync(inputPath)) {
    console.error('❌ Original icon not found at:', inputPath);
    process.exit(1);
  }

  console.log('📁 Input:', inputPath);
  console.log('📁 Output:', outputDir);
  console.log('=' .repeat(60));

  for (const { size, name, quality } of sizes) {
    try {
      const outputPath = path.join(outputDir, name);

      console.log(`\n🔄 Creating ${size}x${size} version...`);

      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({
          quality,
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: true
        })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);

      console.log(`✅ ${name} created`);
      console.log(`   Size: ${sizeKB} KB`);

      if (stats.size > 100 * 1024) {
        console.log(`   ⚠️  WARNING: File size exceeds 100KB`);
      }

    } catch (error) {
      console.error(`❌ Error creating ${name}:`, error.message);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✅ Icon optimization complete!');
  console.log('=' .repeat(60));
  console.log('\n📋 Next Steps:');
  console.log('1. Review generated icons in assets/icons/');
  console.log('2. Use c12usd-256.png for Trust Wallet submission');
  console.log('3. Add icons to your frontend');
  console.log('4. Submit to Trust Wallet Assets repository\n');
}

optimizeIcon()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });