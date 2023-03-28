export const coverPoolABI =  [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_inputPool",
        "type": "address"
      },
      {
        "internalType": "int16",
        "name": "_tickSpread",
        "type": "int16"
      },
      {
        "internalType": "uint16",
        "name": "_twapLength",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "_auctionLength",
        "type": "uint16"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "FactoryOnly",
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
    "name": "InvalidTickSpread",
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
        "internalType": "int24",
        "name": "claim",
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
        "internalType": "int24",
        "name": "claim",
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
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "int24",
            "name": "lower",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "claim",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "upper",
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
          },
          {
            "internalType": "bool",
            "name": "collect",
            "type": "bool"
          }
        ],
        "internalType": "struct ICoverPoolStructs.BurnParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "collectFees",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "token0Fees",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "token1Fees",
        "type": "uint128"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "factory",
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
    "inputs": [],
    "name": "globalState",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "unlocked",
        "type": "uint8"
      },
      {
        "internalType": "int16",
        "name": "tickSpread",
        "type": "int16"
      },
      {
        "internalType": "uint16",
        "name": "twapLength",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "auctionLength",
        "type": "uint16"
      },
      {
        "internalType": "int24",
        "name": "latestTick",
        "type": "int24"
      },
      {
        "internalType": "uint32",
        "name": "genesisBlock",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "lastBlock",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "auctionStart",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "accumEpoch",
        "type": "uint32"
      },
      {
        "internalType": "uint128",
        "name": "liquidityGlobal",
        "type": "uint128"
      },
      {
        "internalType": "uint160",
        "name": "latestPrice",
        "type": "uint160"
      },
      {
        "internalType": "contract IRangePool",
        "name": "inputPool",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "uint128",
            "name": "token0",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "token1",
            "type": "uint128"
          }
        ],
        "internalType": "struct ICoverPoolStructs.ProtocolFees",
        "name": "protocolFees",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "int24",
            "name": "lower",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "claim",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "upper",
            "type": "int24"
          },
          {
            "internalType": "uint128",
            "name": "amount",
            "type": "uint128"
          },
          {
            "internalType": "bool",
            "name": "zeroForOne",
            "type": "bool"
          }
        ],
        "internalType": "struct ICoverPoolStructs.MintParams",
        "name": "params",
        "type": "tuple"
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
        "name": "amountInDelta",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "amountInDeltaMaxClaimed",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "amountOutDeltaMaxClaimed",
        "type": "uint128"
      },
      {
        "internalType": "uint160",
        "name": "price",
        "type": "uint160"
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
        "name": "amountInDelta",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "amountInDeltaMaxClaimed",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "amountOutDeltaMaxClaimed",
        "type": "uint128"
      },
      {
        "internalType": "uint160",
        "name": "price",
        "type": "uint160"
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
        "internalType": "uint8",
        "name": "claimCheckpoint",
        "type": "uint8"
      },
      {
        "internalType": "uint32",
        "name": "accumEpochLast",
        "type": "uint32"
      },
      {
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "liquidityStashed",
        "type": "uint128"
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
      },
      {
        "internalType": "uint160",
        "name": "claimPriceLast",
        "type": "uint160"
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
        "internalType": "uint8",
        "name": "claimCheckpoint",
        "type": "uint8"
      },
      {
        "internalType": "uint32",
        "name": "accumEpochLast",
        "type": "uint32"
      },
      {
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "liquidityStashed",
        "type": "uint128"
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
      },
      {
        "internalType": "uint160",
        "name": "claimPriceLast",
        "type": "uint160"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
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
    "name": "quote",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "inAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "outAmount",
        "type": "uint256"
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
        "internalType": "uint128",
        "name": "amountIn",
        "type": "uint128"
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
    "inputs": [],
    "name": "tickMap",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "blocks",
        "type": "uint256"
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
        "internalType": "int128",
        "name": "liquidityDelta",
        "type": "int128"
      },
      {
        "internalType": "uint128",
        "name": "liquidityDeltaMinus",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "amountInDeltaMaxStashed",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "amountOutDeltaMaxStashed",
        "type": "uint128"
      },
      {
        "components": [
          {
            "internalType": "uint128",
            "name": "amountInDelta",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "amountOutDelta",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "amountInDeltaMax",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "amountOutDeltaMax",
            "type": "uint128"
          }
        ],
        "internalType": "struct ICoverPoolStructs.Deltas",
        "name": "deltas",
        "type": "tuple"
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
        "internalType": "int128",
        "name": "liquidityDelta",
        "type": "int128"
      },
      {
        "internalType": "uint128",
        "name": "liquidityDeltaMinus",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "amountInDeltaMaxStashed",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "amountOutDeltaMaxStashed",
        "type": "uint128"
      },
      {
        "components": [
          {
            "internalType": "uint128",
            "name": "amountInDelta",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "amountOutDelta",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "amountInDeltaMax",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "amountOutDeltaMax",
            "type": "uint128"
          }
        ],
        "internalType": "struct ICoverPoolStructs.Deltas",
        "name": "deltas",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]