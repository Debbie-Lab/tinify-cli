#!/usr/bin/env node

const ora = require('ora')
const glob = require('glob')
const chalk = require('chalk')
const tinify = require('tinify')
const commander = require('commander')

const spinner = ora()
const pkg = require('../package.json')

const program = new commander.Command()
program.version(pkg.version)

// 日均限制调用500次，建议自己申请个Key @url https://tinypng.com/developers
const buildinKey = '2FLqP8PJ3zlhTzcHFL06Xxtt6QDqh5ks'

const timeout = (promise, time=10000) => Promise.race([promise, new Promise((resolve, reject) => setTimeout(() => reject(new Error('Time Out')), time))])

const start = Date.now()

program
  .option('-k, --key <key>', 'API Key，申请方式@see `https://tinypng.com/developers`')
  .option('-c, --curl', '采用`curl`方式进行tinify操作')
  .option('-s, --suffix <suffix>', 'tinify操作后是否给文件添加后缀(默认取代原文件)')
  .parse(process.argv)

tinify.key = program.key || buildinKey

console.log(program.key, program.curl, program.suffix)
Promise.resolve('/Users2/solome/Shell/realsee.com/src/statics/images/work/aiaudiobar/**/+(*.png|*.jpg)')
  .then((pattern) => new Promise((resolve, reject) => {
    glob(pattern, {}, (error, files) => {
      if (error) reject(error)
      else resolve(files)
    })
  }))
  .then(async (files) => {
    for (const file of files) {
      spinner.start()
      spinner.text = `${chalk.cyan('tinifing')} 🤢 ➙ ${file}`
      try {
        await timeout(tinify.fromFile(file).toFile(file.replace('png', 'tinify.png')))
        spinner.text = `${chalk.green('tinified')} 🐼 ➙ ${file}`
        spinner.succeed()
      } catch (error) {
        spinner.fail(`${chalk.bgRedBright('tinify fail')} 👾 ➙ ${chalk.bold.red(error)} ৳ ${file}`)
      }
    }
  })
  .catch((error) => {
    console.log(error)
    spinner.clear()
  })
  .finally(() => {
    console.log(`🎉 Tinify Finished after ${chalk.cyan(Date.now() - start + 'ms')}`)
    spinner.clear()
  })

