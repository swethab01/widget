const fs = require('fs')
const path = require('path')

function createIconEntry(width, height) {
    const headerSize = 40
    const pixelBytes = width * height * 4
    const maskRowBytes = Math.ceil(width / 32) * 4
    const maskBytes = maskRowBytes * height
    const dibSize = headerSize + pixelBytes + maskBytes

    const dib = Buffer.alloc(dibSize)

    // BITMAPINFOHEADER
    dib.writeUInt32LE(headerSize, 0)         // biSize
    dib.writeInt32LE(width, 4)               // biWidth
    dib.writeInt32LE(height * 2, 8)          // biHeight (doubled for icon)
    dib.writeUInt16LE(1, 12)                 // biPlanes
    dib.writeUInt16LE(32, 14)                // biBitCount
    dib.writeUInt32LE(0, 16)                 // biCompression (BI_RGB)
    dib.writeUInt32LE(pixelBytes, 20)        // biSizeImage
    dib.writeInt32LE(0, 24)                  // biXPelsPerMeter
    dib.writeInt32LE(0, 28)                  // biYPelsPerMeter
    dib.writeUInt32LE(0, 32)                 // biClrUsed
    dib.writeUInt32LE(0, 36)                 // biClrImportant

    // Pixels: draw a rounded purple/indigo shield with a glowing cyan pulse dot
    let offset = headerSize
    // Bottom-to-top
    for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
            const cx = (x - width / 2) / (width / 2)
            const cy = (y - height / 2) / (height / 2)
            const dist = Math.sqrt(cx * cx + cy * cy)

            let r = 0, g = 0, b = 0, a = 0

            if (dist < 0.85) {
                // Background purple badge #6366f1 (99, 102, 241) to #8b5cf6 (139, 92, 246)
                const t = (x + y) / (width * 2)
                r = Math.round(99 + t * 40)
                g = Math.round(102 - t * 10)
                b = Math.round(241 + t * 5)
                a = 255

                // Pulse line or center diamond #06b6d4 (cyan)
                const centerDist = Math.sqrt(cx * cx * 2 + cy * cy * 2)
                if (centerDist < 0.35) {
                    // Bright cyan/emerald pulse center
                    r = 56
                    g = 189
                    b = 248
                    a = 255
                }
            } else if (dist < 0.95) {
                // Subtle anti-aliasing edge
                r = 99
                g = 102
                b = 241
                a = Math.round(255 * (0.95 - dist) / 0.1)
            }

            // BGRA format
            dib[offset++] = b
            dib[offset++] = g
            dib[offset++] = r
            dib[offset++] = a
        }
    }

    // Mask is all 0s (transparency handled by 32-bit alpha)
    return { width, height, dibSize, dib }
}

function buildIcoFile(sizes) {
    const entries = sizes.map(s => createIconEntry(s, s))
    const numImages = entries.length
    const dirHeaderSize = 6
    const dirEntrySize = 16
    const totalDirSize = dirHeaderSize + dirEntrySize * numImages

    let currentOffset = totalDirSize
    const dirEntries = []

    for (const e of entries) {
        const entryBuf = Buffer.alloc(16)
        entryBuf.writeUInt8(e.width >= 256 ? 0 : e.width, 0)
        entryBuf.writeUInt8(e.height >= 256 ? 0 : e.height, 1)
        entryBuf.writeUInt8(0, 2)
        entryBuf.writeUInt8(0, 3)
        entryBuf.writeUInt16LE(1, 4)
        entryBuf.writeUInt16LE(32, 6)
        entryBuf.writeUInt32LE(e.dibSize, 8)
        entryBuf.writeUInt32LE(currentOffset, 12)
        dirEntries.push(entryBuf)
        currentOffset += e.dibSize
    }

    const icoHeader = Buffer.alloc(6)
    icoHeader.writeUInt16LE(0, 0)
    icoHeader.writeUInt16LE(1, 2)
    icoHeader.writeUInt16LE(numImages, 4)

    return Buffer.concat([icoHeader, ...dirEntries, ...entries.map(e => e.dib)])
}

const icoBuffer = buildIcoFile([16, 24, 32, 48, 64, 128, 256])

const publicIco = path.join(__dirname, '../public/icon.ico')
const distIco = path.join(__dirname, '../dist/icon.ico')

fs.writeFileSync(publicIco, icoBuffer)
if (fs.existsSync(path.dirname(distIco))) {
    fs.writeFileSync(distIco, icoBuffer)
}

console.log('Successfully generated valid Windows ICO file (' + icoBuffer.length + ' bytes)!')
