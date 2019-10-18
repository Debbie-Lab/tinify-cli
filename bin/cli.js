#!/usr/bin/env node

const ora = require('ora')
const path = require('path')
const glob = require('glob')
const chalk = require('chalk')
const tinify = require('tinify')
const commander = require('commander')

const utils = require('../utils')

const pkg = require('../package.json')
const program = new commander.Command()
program.version(pkg.version)

// 日均限制调用500次，建议自己申请个Key @url https://tinypng.com/developers
const buildinKey = '2FLqP8PJ3zlhTzcHFL06Xxtt6QDqh5ks'

const timeout = (promise, time=10000) => Promise.race([promise, new Promise((resolve, reject) => setTimeout(() => reject(new Error('Time Out')), time))])

const start = Date.now()
const spinner = ora()

program
  .option('-k, --key <key>', 'API Key，申请方式@see `https://tinypng.com/developers`')
  .option('-c, --curl', '采用`curl`方式进行tinify操作')
  .option('-s, --suffix <suffix>', 'tinify操作后是否给文件添加后缀(默认取代原文件)')
  .parse(process.argv)

tinify.key = program.key || buildinKey

const cwd = process.cwd()

const isPngOrJpg = (file) => utils.accessible(file) && (file.endsWith('.png') || file.endsWith('.jpg'))

console.log(chalk.cyan(`


 ████████╗ ██╗ ███╗   ██╗ ██╗ ███████╗ ██╗   ██╗         ██████╗ ██╗      ██╗ 
 ╚══██╔══╝ ██║ ████╗  ██║ ██║ ██╔════╝ ╚██╗ ██╔╝        ██╔════╝ ██║      ██║ 
    ██║    ██║ ██╔██╗ ██║ ██║ █████╗    ╚████╔╝  █████╗ ██║      ██║      ██║ 
    ██║    ██║ ██║╚██╗██║ ██║ ██╔══╝     ╚██╔╝   ╚════╝ ██║      ██║      ██║ 
    ██║    ██║ ██║ ╚████║ ██║ ██║         ██║           ╚██████╗ ███████╗ ██║ 
    ╚═╝    ╚═╝ ╚═╝  ╚═══╝ ╚═╝ ╚═╝         ╚═╝            ╚═════╝ ╚══════╝ ╚═╝ 


`))

spinner.text = '`.png\.jgp` analyzing ...'
spinner.start()

const result = { curr: 0, count: 0, fail: 0 }

Promise.resolve(program.args)
  .then(async (args) => {
    args = args.length === 0 ? [ cwd ] : args
    const entries = []
    for (const curr of args) {
      const file = path.resolve(cwd, curr)
      if (utils.isDirectory(file)) {
        Array.prototype.push.apply(entries, await utils.fetchDirFileList(file))
      } else if (isPngOrJpg(file)) {
         entries.push(file)
      } else {
        console.log('参数异常' + file + '目录or文件不存在')
      }

    }
    result.count = entries.length
    spinner.text = `\`.png\.jgp\` analyzed! ➙ 发现满足tinify要求的文件共 ${result.count} 个`
    spinner.succeed()
    return entries
  })
  .then(async (files) => {
    for (const file of files) {
      result.curr += 1
      spinner.start()
      spinner.text = `${chalk.cyan('tinifing')} ${ result.curr + '/' + result.count} 🤢 ➙ ${file}`
      try {
        const newFile = !program.suffix ? file : file.replace(/\.(jpg|png)$/, '.' + program.suffix + /\.(jpg|png)$/.exec(file)[0])
        await timeout(tinify.fromFile(file).toFile(newFile))
        spinner.text = `${chalk.green('tinified')} 🐼 ➙ ${newFile}`
        spinner.succeed()
      } catch (error) {
        result.fail += 1
        spinner.fail(`${chalk.bgRedBright('tinify fail')} 👾 ➙ ${chalk.bold.red(error)} ৳ ${file}`)
      }
    }

  })
  .catch((error) => {
    console.log(error)
    spinner.clear()
  })
  .finally(() => {
    console.log(`🎉 Tinify Finished after ${chalk.cyan(Date.now() - start + 'ms')} `)
    const { count, fail } = result
    const sucess = count - fail
    console.log(`🎉 Result: ${sucess}/${count},  ${((sucess/count)*100).toFixed(2)}%`)
    spinner.clear()
    process.exit()
  })

