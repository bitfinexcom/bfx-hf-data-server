const path = require('path')
const fs = require('fs/promises')

const dbExt = 'bin'

const parseFrameFilename = (dir, filename) => {
  const [range, ext] = filename.split('.')
  if (ext !== dbExt) {
    throw new Error('Invalid file extension')
  }
  const [start, end] = range.split('-')

  return {
    start: Number(start),
    end: Number(end),
    path: path.join(dir, filename)
  }
}

const getFramesDir = (dir, type, symbol, tf) => {
  return path.join(dir, 'data', symbol, type, tf)
}

const listFrames = async (dir, type, symbol, tf) => {
  const framesDir = getFramesDir(dir, type, symbol, tf)

  try {
    const contents = await fs.readdir(framesDir)
    return contents.map(filename => parseFrameFilename(framesDir, filename))
  } catch (e) {
    return []
  }
}

module.exports = {
  listFrames
}
