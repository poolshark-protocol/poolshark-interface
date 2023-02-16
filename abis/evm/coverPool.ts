export const coverPoolABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_inputPool",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_libraries",
        "type": "address"
      },
      {
        "internalType": "uint24",
        "name": "_swapFee",
        "type": "uint24"
      },
      {
        "internalType": "int24",
        "name": "_tickSpacing",
        "type": "int24"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "InvalidClaimTick",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidPosition",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSwapFee",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTick",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidToken",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "LiquidityOverflow",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Locked",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "LowerNotEvenTick",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MaxTickLiquidity",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotEnoughOutputLiquidity",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotEnoughPositionLiquidity",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotImplementedYet",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Overflow",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Token0Missing",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Token1Missing",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "dest",
        "type": "address"
      }
    ],
    "name": "TransferFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UpperNotOddTick",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WaitUntilEnoughObservations",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WrongTickClaimedAt",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WrongTickLowerOrder",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WrongTickLowerRange",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WrongTickOrder",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WrongTickUpperOrder",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WrongTickUpperRange",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "int24",
        "name": "lower",
        "type": "int24"
      },
      {
        "indexed": true,
        "internalType": "int24",
        "name": "upper",
        "type": "int24"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "zeroForOne",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "liquidityBurned",
        "type": "uint128"
      }
    ],
    "name": "Burn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount0",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount1",
        "type": "uint256"
      }
    ],
    "name": "Collect",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "int24",
        "name": "lower",
        "type": "int24"
      },
      {
        "indexed": true,
        "internalType": "int24",
        "name": "upper",
        "type": "int24"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "zeroForOne",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "liquidityMinted",
        "type": "uint128"
      }
    ],
    "name": "Mint",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "pool",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "token0",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "token1",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint24",
        "name": "fee",
        "type": "uint24"
      },
      {
        "indexed": false,
        "internalType": "int24",
        "name": "tickSpacing",
        "type": "int24"
      }
    ],
    "name": "PoolCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      }
    ],
    "name": "Swap",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "int24",
        "name": "lower",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "upper",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "claim",
        "type": "int24"
      },
      {
        "internalType": "bool",
        "name": "zeroForOne",
        "type": "bool"
      },
      {
        "internalType": "uint128",
        "name": "amount",
        "type": "uint128"
      }
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int24",
        "name": "lower",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "upper",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "claim",
        "type": "int24"
      },
      {
        "internalType": "bool",
        "name": "zeroForOne",
        "type": "bool"
      }
    ],
    "name": "collect",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeTo",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int24",
        "name": "lowerOld",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "lower",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "upperOld",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "upper",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "claim",
        "type": "int24"
      },
      {
        "internalType": "uint128",
        "name": "amountDesired",
        "type": "uint128"
      },
      {
        "internalType": "bool",
        "name": "zeroForOne",
        "type": "bool"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pool0",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "feeGrowthCurrentEpoch",
        "type": "uint128"
      },
      {
        "internalType": "uint160",
        "name": "price",
        "type": "uint160"
      },
      {
        "internalType": "int24",
        "name": "nearestTick",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "lastTick",
        "type": "int24"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pool1",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "feeGrowthCurrentEpoch",
        "type": "uint128"
      },
      {
        "internalType": "uint160",
        "name": "price",
        "type": "uint160"
      },
      {
        "internalType": "int24",
        "name": "nearestTick",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "lastTick",
        "type": "int24"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "int24",
        "name": "",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "",
        "type": "int24"
      }
    ],
    "name": "positions0",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "internalType": "uint32",
        "name": "accumEpochLast",
        "type": "uint32"
      },
      {
        "internalType": "uint160",
        "name": "claimPriceLast",
        "type": "uint160"
      },
      {
        "internalType": "uint128",
        "name": "amountIn",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "amountOut",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "int24",
        "name": "",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "",
        "type": "int24"
      }
    ],
    "name": "positions1",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "internalType": "uint32",
        "name": "accumEpochLast",
        "type": "uint32"
      },
      {
        "internalType": "uint160",
        "name": "claimPriceLast",
        "type": "uint160"
      },
      {
        "internalType": "uint128",
        "name": "amountIn",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "amountOut",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "state",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "unlocked",
        "type": "uint8"
      },
      {
        "internalType": "int24",
        "name": "latestTick",
        "type": "int24"
      },
      {
        "internalType": "uint32",
        "name": "accumEpoch",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "lastBlockNumber",
        "type": "uint32"
      },
      {
        "internalType": "uint24",
        "name": "swapFee",
        "type": "uint24"
      },
      {
        "internalType": "int24",
        "name": "tickSpacing",
        "type": "int24"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "zeroForOne",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint160",
        "name": "priceLimit",
        "type": "uint160"
      }
    ],
    "name": "swap",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int24",
        "name": "",
        "type": "int24"
      }
    ],
    "name": "tickNodes",
    "outputs": [
      {
        "internalType": "int24",
        "name": "previousTick",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "nextTick",
        "type": "int24"
      },
      {
        "internalType": "uint32",
        "name": "accumEpochLast",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int24",
        "name": "",
        "type": "int24"
      }
    ],
    "name": "ticks0",
    "outputs": [
      {
        "internalType": "int104",
        "name": "liquidityDelta",
        "type": "int104"
      },
      {
        "internalType": "uint104",
        "name": "liquidityDeltaMinus",
        "type": "uint104"
      },
      {
        "internalType": "int88",
        "name": "amountInDelta",
        "type": "int88"
      },
      {
        "internalType": "int88",
        "name": "amountOutDelta",
        "type": "int88"
      },
      {
        "internalType": "uint64",
        "name": "amountInDeltaCarryPercent",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "amountOutDeltaCarryPercent",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int24",
        "name": "",
        "type": "int24"
      }
    ],
    "name": "ticks1",
    "outputs": [
      {
        "internalType": "int104",
        "name": "liquidityDelta",
        "type": "int104"
      },
      {
        "internalType": "uint104",
        "name": "liquidityDeltaMinus",
        "type": "uint104"
      },
      {
        "internalType": "int88",
        "name": "amountInDelta",
        "type": "int88"
      },
      {
        "internalType": "int88",
        "name": "amountOutDelta",
        "type": "int88"
      },
      {
        "internalType": "uint64",
        "name": "amountInDeltaCarryPercent",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "amountOutDeltaCarryPercent",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "utils",
    "outputs": [
      {
        "internalType": "contract IPoolsharkUtils",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]