import fs from 'node:fs';
import sharp from 'sharp';
async function main() {
  const mark = fs.readFileSync('src/app/icon.svg');
  for (const [name, color] of [['logo', '#123d32'], ['logo-white', '#ffffff']]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="80" viewBox="0 0 340 80"><svg x="0" y="8" width="64" height="64" viewBox="0 0 48 48">${mark.toString().replace(/<svg[^>]*>|<\/svg>/g,'')}</svg><text x="78" y="43" font-family="Segoe UI,Arial,sans-serif" font-weight="700" font-size="39" letter-spacing="-2" fill="${color}">diplomax.</text><text x="81" y="64" font-family="Segoe UI,Arial,sans-serif" font-weight="600" font-size="12" letter-spacing="5" fill="${color}">DELIVERY</text></svg>`;
    fs.writeFileSync(`public/brand/${name}.svg`, svg);
    await sharp(Buffer.from(svg)).resize(1020,240).png().toFile(`public/${name}.png`);
  }
  await sharp(mark).resize(180,180).png().toFile('src/app/apple-icon.png');
  const png = await sharp(mark).resize(48,48).png().toBuffer();
  const header = Buffer.alloc(22); header.writeUInt16LE(1,2); header.writeUInt16LE(1,4); header[6]=48; header[7]=48; header.writeUInt16LE(1,10); header.writeUInt16LE(32,12); header.writeUInt32LE(png.length,14); header.writeUInt32LE(22,18);
  fs.writeFileSync('src/app/favicon.ico', Buffer.concat([header,png]));
}
main().catch(e=>{console.error(e);process.exit(1)});

