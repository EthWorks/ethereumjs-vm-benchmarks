"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var ethereumjs_account_1 = require("ethereumjs-account");
var ethereumjs_blockchain_1 = require("ethereumjs-blockchain");
var ethereumjs_common_1 = require("ethereumjs-common");
var state_1 = require("./state");
var runCode_1 = require("./runCode");
var runCall_1 = require("./runCall");
var runTx_1 = require("./runTx");
var runBlock_1 = require("./runBlock");
var opcodes_1 = require("./evm/opcodes");
var runBlockchain_1 = require("./runBlockchain");
var promisified_1 = require("./state/promisified");
var promisify = require('util.promisify');
var AsyncEventEmitter = require('async-eventemitter');
var Trie = require('merkle-patricia-tree').SecureTrie;
/**
 * Execution engine which can be used to run a blockchain, individual
 * blocks, individual transactions, or snippets of EVM bytecode.
 *
 * This class is an AsyncEventEmitter, please consult the README to learn how to use it.
 */
var VM = /** @class */ (function (_super) {
    __extends(VM, _super);
    /**
     * Instantiates a new [[VM]] Object.
     * @param opts - Default values for the options are:
     *  - `chain`: 'mainnet'
     *  - `hardfork`: 'petersburg' [supported: 'byzantium', 'constantinople', 'petersburg', 'istanbul' (DRAFT) (will throw on unsupported)]
     *  - `activatePrecompiles`: false
     *  - `allowUnlimitedContractSize`: false [ONLY set to `true` during debugging]
     */
    function VM(opts) {
        if (opts === void 0) { opts = {}; }
        var _this = _super.call(this) || this;
        _this.isInitialized = false;
        _this.opts = opts;
        if (opts.common) {
            if (opts.chain || opts.hardfork) {
                throw new Error('You can only instantiate the VM class with one of: opts.common, or opts.chain and opts.hardfork');
            }
            _this._common = opts.common;
        }
        else {
            var chain = opts.chain ? opts.chain : 'mainnet';
            var hardfork = opts.hardfork ? opts.hardfork : 'petersburg';
            var supportedHardforks = [
                'byzantium',
                'constantinople',
                'petersburg',
                'istanbul',
                'muirGlacier',
            ];
            _this._common = new ethereumjs_common_1.default(chain, hardfork, supportedHardforks);
        }
        // Set list of opcodes based on HF
        _this._opcodes = opcodes_1.getOpcodesForHF(_this._common);
        if (opts.stateManager) {
            _this.stateManager = opts.stateManager;
        }
        else {
            var trie = opts.state || new Trie();
            _this.stateManager = new state_1.StateManager({ trie: trie, common: _this._common });
        }
        _this.pStateManager = new promisified_1.default(_this.stateManager);
        _this.blockchain = opts.blockchain || new ethereumjs_blockchain_1.default({ common: _this._common });
        _this.allowUnlimitedContractSize =
            opts.allowUnlimitedContractSize === undefined ? false : opts.allowUnlimitedContractSize;
        // We cache this promisified function as it's called from the main execution loop, and
        // promisifying each time has a huge performance impact.
        _this._emit = promisify(_this.emit.bind(_this));
        return _this;
    }
    /**
     * VM async constructor. Creates engine instance and initializes it.
     *
     * @param opts VM engine constructor options
     */
    VM.create = function (opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var vm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vm = new this(opts);
                        return [4 /*yield*/, vm.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, vm];
                }
            });
        });
    };
    VM.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var opts, trie, put, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isInitialized) {
                            return [2 /*return*/];
                        }
                        opts = this.opts;
                        if (!(opts.activatePrecompiles && !opts.stateManager)) return [3 /*break*/, 4];
                        trie = this.stateManager._trie;
                        put = promisify(trie.put.bind(trie));
                        i = 1;
                        _a.label = 1;
                    case 1:
                        if (!(i <= 8)) return [3 /*break*/, 4];
                        return [4 /*yield*/, put(new BN(i).toArrayLike(Buffer, 'be', 20), new ethereumjs_account_1.default().serialize())];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.isInitialized = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Processes blocks and adds them to the blockchain.
     *
     * This method modifies the state.
     *
     * @param blockchain -  A [blockchain](https://github.com/ethereum/ethereumjs-blockchain) object to process
     */
    VM.prototype.runBlockchain = function (blockchain) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, runBlockchain_1.default.bind(this)(blockchain)];
                }
            });
        });
    };
    /**
     * Processes the `block` running all of the transactions it contains and updating the miner's account
     *
     * This method modifies the state. If `generate` is `true`, the state modifications will be
     * reverted if an exception is raised. If it's `false`, it won't revert if the block's header is
     * invalid. If an error is thrown from an event handler, the state may or may not be reverted.
     *
     * @param opts - Default values for options:
     *  - `generate`: false
     */
    VM.prototype.runBlock = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, runBlock_1.default.bind(this)(opts)];
                }
            });
        });
    };
    /**
     * Process a transaction. Run the vm. Transfers eth. Checks balances.
     *
     * This method modifies the state. If an error is thrown, the modifications are reverted, except
     * when the error is thrown from an event handler. In the latter case the state may or may not be
     * reverted.
     */
    VM.prototype.runTx = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, runTx_1.default.bind(this)(opts)];
                }
            });
        });
    };
    /**
     * runs a call (or create) operation.
     *
     * This method modifies the state.
     */
    VM.prototype.runCall = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, runCall_1.default.bind(this)(opts)];
                }
            });
        });
    };
    /**
     * Runs EVM code.
     *
     * This method modifies the state.
     */
    VM.prototype.runCode = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, runCode_1.default.bind(this)(opts)];
                }
            });
        });
    };
    /**
     * Returns a copy of the [[VM]] instance.
     */
    VM.prototype.copy = function () {
        return new VM({
            stateManager: this.stateManager.copy(),
            blockchain: this.blockchain,
            common: this._common,
        });
    };
    return VM;
}(AsyncEventEmitter));
exports.default = VM;
//# sourceMappingURL=index.js.map