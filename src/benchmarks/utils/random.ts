import { utils } from 'ethers'

export function randomEthValue (min: number, max: number) {
  return utils.parseEther((min + Math.random() * (max - min)).toString())
}

export function choose1<T> (array: T[]) {
  return array[uniform(0, array.length)]
}

export function choose2<T> (array: T[]) {
  const index1 = uniform(0, array.length)
  const index2 = (index1 + uniform(1, array.length)) % array.length
  return [array[index1], array[index2]]
}

export function uniform (min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min))
}

export function randomEthAddress () {
  return '0x' + new Array(40).fill(0).map(randomHexDigit).join('')
}

function randomHexDigit () {
  return choose1(Array.from('0123456789abcdef'))
}
