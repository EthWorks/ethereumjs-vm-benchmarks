import VM from '@nomiclabs/ethereumjs-vm'
import { Transaction } from 'ethereumjs-tx'
// eslint-disable-next-line no-restricted-imports
import { RunTxResult } from '@nomiclabs/ethereumjs-vm/dist/runTx'
import { ChainOptions } from '../ChainOptions'
import { getLatestBlock } from './getLatestBlock'

export async function runIsolatedTransaction (
  vm: VM,
  transaction: Transaction,
  options: ChainOptions,
): Promise<RunTxResult> {
  const psm = vm.pStateManager
  const initialStateRoot = await psm.getStateRoot()

  try {
    const latestBlock = await getLatestBlock(vm)
    const result = await vm.runTx({
      block: latestBlock,
      tx: transaction,
      skipNonce: options.skipNonceCheck,
      skipBalance: options.skipBalanceCheck,
    })
    return result
  } finally {
    await psm.setStateRoot(initialStateRoot)
  }
}
