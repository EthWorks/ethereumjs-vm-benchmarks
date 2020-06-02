import { createSimpleChain, SimpleProvider } from '../chain'

export async function getFreshProvider () {
  const chain = await createSimpleChain()
  return new SimpleProvider(chain)
}
