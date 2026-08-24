import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ICONS_DIR = './public/assets/icons';
const CANVAS_SIZE = 256;       // square canvas size
const ICON_AREA = 200;         // max icon size within canvas (rest is padding)
const BACKUP_DIR = './public/assets/icons_backup';

// Create backup
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const files = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.png'));

for (const file of files) {
  const inputPath = path.join(ICONS_DIR, file);
  const backupPath = path.join(BACKUP_DIR, file);
  
  // Backup original
  fs.copyFileSync(inputPath, backupPath);
  
  // Get metadata
  const meta = await sharp(inputPath).metadata();
  console.log(`Processing ${file}: ${meta.width}x${meta.height}`);
  
  // Resize to fit within ICON_AREA, maintaining aspect ratio, 
  // then extend to CANVAS_SIZE with transparent padding
  await sharp(inputPath)
    .resize(ICON_AREA, ICON_AREA, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .extend({
      top: Math.floor((CANVAS_SIZE - ICON_AREA) / 2),
      bottom: Math.ceil((CANVAS_SIZE - ICON_AREA) / 2),
      left: Math.floor((CANVAS_SIZE - ICON_AREA) / 2),
      right: Math.ceil((CANVAS_SIZE - ICON_AREA) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(inputPath + '.tmp');
  
  // Replace original with processed
  fs.unlinkSync(inputPath);
  fs.renameSync(inputPath + '.tmp', inputPath);
  
  // Verify
  const newMeta = await sharp(inputPath).metadata();
  console.log(`  -> ${newMeta.width}x${newMeta.height} ✓`);
}

console.log('\nAll icons normalized to ' + CANVAS_SIZE + 'x' + CANVAS_SIZE + ' with uniform padding!');
console.log('Backups saved to: ' + BACKUP_DIR);
