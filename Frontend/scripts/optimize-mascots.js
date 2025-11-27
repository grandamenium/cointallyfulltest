const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const mascotDir = path.join(__dirname, '../public/mascot');
const optimizedDir = path.join(__dirname, '../public/mascot/optimized');

// Create optimized directory if it doesn't exist
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

const sizes = [150, 200, 300];

const mascots = [
  'mascot-arrested-by-irs.png',
  'mascot-at-desk-analyzing-charts.png',
  'mascot-holding-bitcoin.png',
  'mascot-sitting-on-money.png',
  'mascot-standing.png',
  'mascot-stressed-panicking.png',
  'mascot-with-cigar-on-money.png',
  'mascot-with-coin-symbol.png',
  'mascot-with-headphones-cigar-money.png',
  'mascot-with-large-bitcoin.png',
];

async function optimizeMascots() {
  for (const mascot of mascots) {
    const inputPath = path.join(mascotDir, mascot);

    // Check if file exists
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${mascot} - file not found`);
      continue;
    }

    const baseName = path.basename(mascot, '.png');

    for (const size of sizes) {
      const outputPath = path.join(optimizedDir, `${baseName}-${size}.webp`);

      try {
        await sharp(inputPath)
          .resize(size, null, { fit: 'inside' })
          .webp({ quality: 85 })
          .toFile(outputPath);

        console.log(`✓ Created ${baseName}-${size}.webp`);
      } catch (error) {
        console.error(`✗ Error processing ${mascot}:`, error.message);
      }
    }
  }

  console.log('\n✨ Mascot optimization complete!');
}

optimizeMascots();
