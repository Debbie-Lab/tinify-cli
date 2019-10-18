const fs = require('fs')
const path = require('path')
const glob = require('glob')

const funcSafely = (func, ...defaultValues) => {
  try {
    return func()
  } catch (error) {
    return  defaultValues.length === 0 ? error : defaultValues[0]
  }
}

const isDirectory = (filepath) => funcSafely(() => fs.lstatSync(filepath).isDirectory(), false)

exports.isDirectory = isDirectory


const fetchDirFileList = (filepath) => {
  if (!isDirectory(filepath)) return [filepath]

  return new Promise((resolve, reject) => glob('**/*+(.png|.jpg)', { cwd: filepath }, (error, files) => {
    if (error) return reject(error)
    resolve(files.map((f) => path.resolve(filepath, f)))
  }))
}

exports.fetchDirFileList = fetchDirFileList

function accessible() {
  try {
    fs.accessSync.apply(fs, arguments)
    return true
  } catch (error/* not care */) {
    return false
  }
}

exports.accessible = accessible

