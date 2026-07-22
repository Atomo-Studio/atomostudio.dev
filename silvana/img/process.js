const sharp = require('/home/mario/atomo-studio/web-factory/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const imgDir = '/home/mario/atomo-studio/sites/silvana/img';
const files = fs.readdirSync(imgDir).filter(f => f.startsWith('producto') && f.endsWith('.jpg'));

async function processAll() {
  for (const file of files) {
    const inputPath = path.join(imgDir, file);
    const outputName = file.replace('.jpg', '.webp');
    const outputPath = path.join(imgDir, 'processed', outputName);
    
    const metadata = await sharp(inputPath).metadata();
    const result = await sharp(inputPath)
      .resize(800, 800, { fit: 'cover', position: 'centre' })
      .modulate({ brightness: 1.1, saturation: 1.2 })
      .sharpen()
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    const sizeKB = (result.size / 1024).toFixed(0);
    console.log(`✅ ${file} → ${outputName} (${sizeKB}KB)`);
  }
  console.log('\n✅ Todas las imágenes procesadas');
}

processAll().catch(e => console.error(e));
