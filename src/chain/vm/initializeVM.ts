import VM from '@nomiclabs/ethereumjs-vm'
import Common from 'ethereumjs-common'
import Account from 'ethereumjs-account'
import { toBuffer } from 'ethereumjs-util'
import { Wallet } from 'ethers'
import BN from 'bn.js'
import { ChainOptions } from '../ChainOptions'
import { putGenesisBlock } from './putGenesisBlock'
import Blockchain from 'ethereumjs-blockchain'

export async function initializeVM (options: ChainOptions) {
  const common = Common.forCustomChain(
    'mainnet',
    {
      chainId: options.chainId,
      networkId: options.chainId,
      name: options.chainName,
    },
    options.hardfork,
  )
  const callbackBlockchain = new Blockchain({ common, validate: false })
  const vm = new VM({ common, blockchain: callbackBlockchain as any })
  await initAccounts(vm, options)
  await putGenesisBlock(vm, options)
  return vm
}

async function initAccounts (vm: VM, options: ChainOptions) {
  const psm = vm.pStateManager
  const balance = new BN(options.accounts.initialBalance.toString()).toBuffer()
  for (const privateKey of options.accounts.privateKeys) {
    const { address } = new Wallet(privateKey)
    await psm.putAccount(toBuffer(address), new Account({ balance }))
  }
}
