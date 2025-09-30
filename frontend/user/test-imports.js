// Test script to verify module resolution
console.log('Testing module imports...');

try {
  const firebase = require('firebase/app');
  console.log('✓ Firebase/app resolved');
} catch (e) {
  console.log('✗ Firebase/app failed:', e.message);
}

try {
  const tailwindMerge = require('tailwind-merge');
  console.log('✓ Tailwind-merge resolved');
} catch (e) {
  console.log('✗ Tailwind-merge failed:', e.message);
}

try {
  const framerMotion = require('framer-motion');
  console.log('✓ Framer-motion resolved');
} catch (e) {
  console.log('✗ Framer-motion failed:', e.message);
}

console.log('Module test complete.');