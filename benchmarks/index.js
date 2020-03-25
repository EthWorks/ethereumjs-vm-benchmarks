const { run: run01 } = require('./01')
const { run: run02 } = require('./02')

async function benchmark (name, fn) {
  console.time(name)
  await fn()
  console.timeEnd(name)
}

async function main () {
  await benchmark('benchmark 01', run01)
  await benchmark('benchmark 02', run02)
}

main()