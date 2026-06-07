const fs = require('fs')
const path = require('path')

const pwaDir = path.join(__dirname, '..', 'public')
const pngPath = path.join(pwaDir, 'favicon.png')
const icoPath = path.join(pwaDir, 'favicon.ico')

const png = fs.readFileSync(pngPath)
const pngSize = png.length
const dataOffset = 6 + 16 // ICONDIR(6) + ICONDIRENTRY(16)

const ico = Buffer.alloc(dataOffset + pngSize)

// ICONDIR header
ico.writeUInt16LE(0, 0)          // reserved
ico.writeUInt16LE(1, 2)          // type: 1 = ICO
ico.writeUInt16LE(1, 4)          // count: 1 image

// ICONDIRENTRY
ico.writeUInt8(32, 6)            // width
ico.writeUInt8(32, 7)            // height
ico.writeUInt8(0, 8)             // color count (0 = truecolor)
ico.writeUInt8(0, 9)             // reserved
ico.writeUInt16LE(1, 10)         // planes
ico.writeUInt16LE(32, 12)        // bits per pixel
ico.writeUInt32LE(pngSize, 14)   // size of image data
ico.writeUInt32LE(dataOffset, 18) // offset to image data

png.copy(ico, dataOffset)

fs.writeFileSync(icoPath, ico)
console.log('favicon.ico: ' + ico.length + ' bytes (ICO con PNG 32x32 embedded)')
