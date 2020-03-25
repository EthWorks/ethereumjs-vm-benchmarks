const { utils } = require('ethers')

function randomEthValue (min, max) {
  return utils.parseEther((min + Math.random() * (max - min)).toString())
}

function choose1 (array) {
  return array[uniform(0, array.length)]
}

function choose2 (array) {
  const index1 = uniform(0, array.length)
  const index2 = (index1 + uniform(1, array.length)) % array.length
  return [array[index1], array[index2]]
}

function uniform (min, max) {
  return Math.floor(min + Math.random() * (max - min))
}

module.exports = {
  randomEthValue,
  choose1,
  choose2,
  uniform,
}