// Genera favicon.png (32x32), apple-touch-icon.png (180x180) e favicon.ico da favicon.svg
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const publicDir = path.join(__dirname, '..', 'public')
const svgPath = path.join(publicDir, 'favicon.svg')

async function main() {
  const svg = fs.readFileSync(svgPath)

  // favicon.png — 32x32
  const png32 = await sharp(svg, { density: 300 })
    .resize(32, 32)
    .png({ compressionLevel: 9 })
    .toBuffer()
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), png32)
  console.log('favicon.png:', png32.length, 'bytes')

  // favicon.ico — ICO container con PNG 32x32 embedded
  const dataOffset = 6 + 16
  const ico = Buffer.alloc(dataOffset + png32.length)
  ico.writeUInt16LE(0, 0)
  ico.writeUInt16LE(1, 2)
  ico.writeUInt16LE(1, 4)
  ico.writeUInt8(32, 6)
  ico.writeUInt8(32, 7)
  ico.writeUInt8(0, 8)
  ico.writeUInt8(0, 9)
  ico.writeUInt16LE(1, 10)
  ico.writeUInt16LE(32, 12)
  ico.writeUInt32LE(png32.length, 14)
  ico.writeUInt32LE(dataOffset, 18)
  png32.copy(ico, dataOffset)
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico)
  console.log('favicon.ico:', ico.length, 'bytes')

  // apple-touch-icon.png — 180x180
  const png180 = await sharp(svg, { density: 300 })
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toBuffer()
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180)
  console.log('apple-touch-icon.png:', png180.length, 'bytes')

  // icons/
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
  for (const size of sizes) {
    const buf = await sharp(svg, { density: 300 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer()
    fs.writeFileSync(path.join(publicDir, 'icons', `icon-${size}x${size}.png`), buf)
    console.log(`icons/icon-${size}x${size}.png:`, buf.length, 'bytes')
  }

  console.log('\nFatto!')
}

main().catch(e => { console.error(e); process.exit(1) })
