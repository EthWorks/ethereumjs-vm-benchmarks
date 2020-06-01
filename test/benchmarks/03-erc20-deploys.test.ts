import { expect } from 'chai'
import { parseEther } from 'ethers/utils'
import { Contract } from 'ethers/contract'
import { createSimpleChain, SimpleChain, SimpleProvider } from '../../src/chain'
import { getERC20DeploymentTransaction } from '../../src/benchmarks/utils/transactions'
import { deployERC20 } from '../../src/benchmarks/utils/deploy'
import { NonceCounter } from '../../src/benchmarks/utils/NonceCounter'

const ERC20Mock = require('../../contracts/ERC20Mock.json')

describe('ERC20 deploys', () => {
  let chain: SimpleChain
  let provider: SimpleProvider
  let nonceCounter: NonceCounter

  beforeEach(async () => {
    chain = await createSimpleChain()
    provider = new SimpleProvider(chain)
    nonceCounter = new NonceCounter()
  })

  it('supports deployment of ERC20 token contract', async () => {
    const [deployer] = provider.getWallets()
    const initialBalance = parseEther('100')

    const deployParams = {
      deployer,
      initialAccount: deployer.address,
      initialBalance,
      nonceCounter,
    }
    const { deployment, futureAddress } = await getERC20DeploymentTransaction(deployParams)
    await chain.sendTransaction(deployment)

    const token = new Contract(futureAddress, ERC20Mock.abi, provider)
    const balance = await token.balanceOf(deployer.address)

    expect(balance.eq(initialBalance)).to.be.true
  })

  it('supports multiple ERC20 deployments', async () => {
    const [deployer] = provider.getWallets()
    const initialBalance = parseEther('100')

    for (let i = 0; i < 10; i++) {
      const token = await deployERC20(deployer, chain, nonceCounter)
      const balance = await token.balanceOf(deployer.address)
      expect(balance.eq(initialBalance)).to.be.true
    }
  })
})
