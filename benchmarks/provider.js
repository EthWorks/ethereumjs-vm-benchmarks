const { MockProvider } = require('@ethereum-waffle/provider')

exports.provider = new MockProvider({ hardfork: 'istanbul' })
