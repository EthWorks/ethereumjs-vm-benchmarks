# Benchmarks

## Full

Time taken `60000 ms`

### Remove `errno` dependency from levelup - up to 1.7% speedup

merkle-patricia-tree has levelup as dependency. Calling `db.get` (`levelup@1.3.9 /lib/levelup.js:195`) in levelup sometimes results in errors. The program spends 1.7% of the total runtime just constructing those errors.

Probably caused by weird stack trace manipulations.

TODO: how many errors?

### Reduce the number of times hashes have to be calculated - up to 4.48% speedup

- `Keccak.update` - 3.28%
- `Keccak.digest` - 1.20%

This is mainly called in the following places: `TrieNode.hash`, `BlockHeader.hash` and `Transaction.hash`. Potential optimisations: memoization, per-object caching.

### Optimize garbage collection - up to 3.29% speedup

Not really my area of expertise. I know you have been looking into it previously and since it isn't that big of a number I decided to put my focus elsewhere.

### Optimize ethereumjs-util toBuffer regex - up to 0.59% speedup

Ganache uses the `toBuffer` function for deserialization. This gets called quite often and checks the correctness of a hex string using a regex (by calling `isHexString` from `ethjs-util`). A potential performance gain could result from having a hand written simple parser for this use case.

### Optimize Common.param - up to 2.29% speedup

Mainly used by `Transaction.getDataFee`. `Common.param` can probably be made faster by using maps instead of loops.

TODO: investigate further.

### Optimize Interpreter._runStepHook - up to 1.98% speedup

What is important to note that `Interpreter.run` spends 1/3 of the time in just `_runStepHook`.

Further investigation shows how much time is actually wasted on transpiled async code. In the 60s benchmark `_runStepHook` takes around 1247.9 ms. Of this time only:
  - 357.4 ms is spent in `AsyncEventEmitter.emit`
  - 154.8 ms is spent in `Interpreter.lookupOpInfo`
  - 1.5 ms is spent in `EEI.getGasLeft`

### Optimize Interpreter.runStep - up to 3.21% speedup

This is the main meat of the vm, so naturally a lot of time is spent here.
As with `_runStepHook` there is significant waste introduced by transpiled async code. Out of the 2020.5 ms spent inside `Interpreter.runStep` only 1547.8 ms actually runs the opcode functions.

To guide the focus of any potential optimisations i present the list of most time consuming opcodes:

- PUSH - 0.39% of total execution time
- SHA3 - 0.38% of total execution time. I believe that SHA3 ranks so high, because of the solidity data structures such as mappings, which rely on hashes internally.
- SLOAD - 0.24% of total execution time
- MSTORE - 0.24% of total execution time
- SSTORE - 0.17% of total execution time

Notable mention:

- `Interpreter.getOpHandler` - 0.13% of total execution time. No clue why so high
