const fs = require('fs')
const path = require('path')

const sourceJpg = 'C:\\Users\\sanja\\.gemini\\antigravity-ide\\brain\\e14b61d0-d2d8-4b66-8e98-4d6ae6791778\\devpulse_icon_1788690263805.jpg'
const publicDir = path.join(__dirname, '..', 'public')

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
}

const targetPng = path.join(publicDir, 'icon.png')
const targetIco = path.join(publicDir, 'icon.ico')

// Copy image to icon.png
fs.copyFileSync(sourceJpg, targetPng)
console.log('Saved icon.png to', targetPng)

// Create an ICO containing the image stream
const imgBuffer = fs.readFileSync(sourceJpg)
const header = Buffer.alloc(22)

// ICONDIR
header.writeUInt16LE(0, 0) // Reserved
header.writeUInt16LE(1, 2) // Type 1 = ICO
header.writeUInt16LE(1, 4) // Count = 1

// ICONDIRENTRY
header.writeUInt8(0, 6)    // Width 0 = 256px
header.writeUInt8(0, 7)    // Height 0 = 256px
header.writeUInt8(0, 8)    // Color count 0 = >= 8bpp
header.writeUInt8(0, 9)    // Reserved
header.writeUInt16LE(1, 10) // Color planes
header.writeUInt16LE(32, 12) // Bits per pixel
header.writeUInt32LE(imgBuffer.length, 14) // Size of image data
header.writeUInt32LE(22, 18) // Offset of image data (22 bytes)

const icoBuffer = Buffer.concat([header, imgBuffer])
fs.writeFileSync(targetIco, icoBuffer)
console.log('Saved icon.ico to', targetIco)
