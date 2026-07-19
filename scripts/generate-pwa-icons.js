// scripts/generate-pwa-icons.js
// Régénère les icônes PWA (public/icons/) à partir de l'emblème (la colombe)
// recadré depuis public/shalom-logo.png. À relancer si le logo change.
//
// Usage : node scripts/generate-pwa-icons.js

const sharp = require('sharp');
const path = require('path');

const SRC = path.resolve(__dirname, '../public/shalom-logo.png');
const OUT_DIR = path.resolve(__dirname, '../public/icons');

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
// Emblème (colombe) recadré depuis le logo complet, sans le texte "SHALOM".
const CROP = { left: 340, top: 20, width: 850, height: 650 };

async function main() {
  const cropped = sharp(SRC).extract(CROP);

  // Icônes standard : le dessin remplit tout le canevas carré.
  for (const size of [192, 512]) {
    await cropped.clone()
      .resize(size, size, { fit: 'contain', background: WHITE })
      .png()
      .toFile(path.join(OUT_DIR, `icon-${size}.png`));
  }

  // Icône "maskable" : marge de sécurité ~30% (le SE peut découper en cercle/squircle).
  for (const size of [192, 512]) {
    const inner = Math.round(size * 0.7);
    const pad = Math.round((size - inner) / 2);
    const innerBuf = await cropped.clone()
      .resize(inner, inner, { fit: 'contain', background: WHITE })
      .png()
      .toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
      .composite([{ input: innerBuf, left: pad, top: pad }])
      .png()
      .toFile(path.join(OUT_DIR, `icon-maskable-${size}.png`));
  }

  // Apple touch icon (180x180, pas de transparence attendue par iOS).
  await cropped.clone()
    .resize(180, 180, { fit: 'contain', background: WHITE })
    .flatten({ background: WHITE })
    .png()
    .toFile(path.join(OUT_DIR, 'apple-touch-icon.png'));

  console.log('Icônes générées dans', OUT_DIR);
}

main().catch((err) => { console.error(err); process.exit(1); });
