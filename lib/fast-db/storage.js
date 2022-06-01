const path = require('path')
const { readdir } = require('fs/promises')
const { createWriteStream, createReadStream } = require('fs')

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
    const contents = await readdir(framesDir)
    return contents.map(filename => parseFrameFilename(framesDir, filename))
  } catch (e) {
    return []
  }
}

// TODO: rename
const createWriteableStream = (dir, type, symbol, tf, start, end) => {
  const framesDir = getFramesDir(dir, type, symbol, tf)
  const fileName = `${start}-${end}.${dbExt}`
  const filePath = path.join(framesDir, fileName)

  return createWriteStream(filePath)
}

// TODO: rename
const read = (filePath) => {
  return createReadStream(filePath)
}

module.exports = {
  listFrames,
  createWriteableStream,
  read
}
