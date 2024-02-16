export const poolsharkRouterABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "limitPoolFactory_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "coverPoolFactory_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "wethAddress_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "router",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "limitPoolFactory",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "coverPoolFactory",
        "type": "address"
      }
    ],
    "name": "RouterDeployed",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "coverPoolFactory",
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
        "internalType": "int256",
        "name": "amount0Delta",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "amount1Delta",
        "type": "int256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "coverPoolMintCallback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int256",
        "name": "amount0Delta",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "amount1Delta",
        "type": "int256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "coverPoolSwapCallback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "poolType",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "tokenIn",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenOut",
            "type": "address"
          },
          {
            "internalType": "uint16",
            "name": "feeTier",
            "type": "uint16"
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
          }
        ],
        "internalType": "struct ICoverPoolFactory.CoverPoolParams",
        "name": "params",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint128",
            "name": "amount",
            "type": "uint128"
          },
          {
            "internalType": "uint32",
            "name": "positionId",
            "type": "uint32"
          },
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
            "internalType": "bool",
            "name": "zeroForOne",
            "type": "bool"
          },
          {
            "internalType": "bytes",
            "name": "callbackData",
            "type": "bytes"
          }
        ],
        "internalType": "struct PoolsharkStructs.MintCoverParams[]",
        "name": "mintCoverParams",
        "type": "tuple[]"
      }
    ],
    "name": "createCoverPoolAndMint",
    "outputs": [
      {
        "internalType": "address",
        "name": "pool",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "poolToken",
        "type": "address"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "tokenIn",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenOut",
            "type": "address"
          },
          {
            "internalType": "uint160",
            "name": "startPrice",
            "type": "uint160"
          },
          {
            "internalType": "uint16",
            "name": "swapFee",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "poolTypeId",
            "type": "uint16"
          }
        ],
        "internalType": "struct PoolsharkStructs.LimitPoolParams",
        "name": "params",
        "type": "tuple"
      },
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
            "name": "upper",
            "type": "int24"
          },
          {
            "internalType": "uint32",
            "name": "positionId",
            "type": "uint32"
          },
          {
            "internalType": "uint128",
            "name": "amount0",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "amount1",
            "type": "uint128"
          },
          {
            "internalType": "bytes",
            "name": "callbackData",
            "type": "bytes"
          }
        ],
        "internalType": "struct PoolsharkStructs.MintRangeParams[]",
        "name": "mintRangeParams",
        "type": "tuple[]"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint128",
            "name": "amount",
            "type": "uint128"
          },
          {
            "internalType": "uint96",
            "name": "mintPercent",
            "type": "uint96"
          },
          {
            "internalType": "uint32",
            "name": "positionId",
            "type": "uint32"
          },
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
            "internalType": "bool",
            "name": "zeroForOne",
            "type": "bool"
          },
          {
            "internalType": "bytes",
            "name": "callbackData",
            "type": "bytes"
          }
        ],
        "internalType": "struct PoolsharkStructs.MintLimitParams[]",
        "name": "mintLimitParams",
        "type": "tuple[]"
      }
    ],
    "name": "createLimitPoolAndMint",
    "outputs": [
      {
        "internalType": "address",
        "name": "pool",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "poolToken",
        "type": "address"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tgePool",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "staker",
        "type": "address"
      }
    ],
    "name": "deployTge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ethAddress",
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
    "name": "limitPoolFactory",
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
        "internalType": "int256",
        "name": "amount0Delta",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "amount1Delta",
        "type": "int256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "limitPoolMintLimitCallback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int256",
        "name": "amount0Delta",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "amount1Delta",
        "type": "int256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "limitPoolMintRangeCallback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int256",
        "name": "amount0Delta",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "amount1Delta",
        "type": "int256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "limitPoolSwapCallback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "pools",
        "type": "address[]"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint160",
            "name": "priceLimit",
            "type": "uint160"
          },
          {
            "internalType": "uint128",
            "name": "amount",
            "type": "uint128"
          },
          {
            "internalType": "bool",
            "name": "exactIn",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "zeroForOne",
            "type": "bool"
          },
          {
            "internalType": "bytes",
            "name": "callbackData",
            "type": "bytes"
          }
        ],
        "internalType": "struct PoolsharkStructs.SwapParams[]",
        "name": "params",
        "type": "tuple[]"
      }
    ],
    "name": "multiCall",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "pools",
        "type": "address[]"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint128",
            "name": "amount",
            "type": "uint128"
          },
          {
            "internalType": "uint32",
            "name": "positionId",
            "type": "uint32"
          },
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
            "internalType": "bool",
            "name": "zeroForOne",
            "type": "bool"
          },
          {
            "internalType": "bytes",
            "name": "callbackData",
            "type": "bytes"
          }
        ],
        "internalType": "struct PoolsharkStructs.MintCoverParams[]",
        "name": "params",
        "type": "tuple[]"
      }
    ],
    "name": "multiMintCover",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "pools",
        "type": "address[]"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint128",
            "name": "amount",
            "type": "uint128"
          },
          {
            "internalType": "uint96",
            "name": "mintPercent",
            "type": "uint96"
          },
          {
            "internalType": "uint32",
            "name": "positionId",
            "type": "uint32"
          },
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
            "internalType": "bool",
            "name": "zeroForOne",
            "type": "bool"
          },
          {
            "internalType": "bytes",
            "name": "callbackData",
            "type": "bytes"
          }
        ],
        "internalType": "struct PoolsharkStructs.MintLimitParams[]",
        "name": "params",
        "type": "tuple[]"
      }
    ],
    "name": "multiMintLimit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "pools",
        "type": "address[]"
      },
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
            "name": "upper",
            "type": "int24"
          },
          {
            "internalType": "uint32",
            "name": "positionId",
            "type": "uint32"
          },
          {
            "internalType": "uint128",
            "name": "amount0",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "amount1",
            "type": "uint128"
          },
          {
            "internalType": "bytes",
            "name": "callbackData",
            "type": "bytes"
          }
        ],
        "internalType": "struct PoolsharkStructs.MintRangeParams[]",
        "name": "params",
        "type": "tuple[]"
      }
    ],
    "name": "multiMintRange",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "pools",
        "type": "address[]"
      },
      {
        "components": [
          {
            "internalType": "uint160",
            "name": "priceLimit",
            "type": "uint160"
          },
          {
            "internalType": "uint128",
            "name": "amount",
            "type": "uint128"
          },
          {
            "internalType": "bool",
            "name": "exactIn",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "zeroForOne",
            "type": "bool"
          }
        ],
        "internalType": "struct PoolsharkStructs.QuoteParams[]",
        "name": "params",
        "type": "tuple[]"
      },
      {
        "internalType": "bool",
        "name": "sortResults",
        "type": "bool"
      }
    ],
    "name": "multiQuote",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "pool",
            "type": "address"
          },
          {
            "internalType": "int256",
            "name": "amountIn",
            "type": "int256"
          },
          {
            "internalType": "int256",
            "name": "amountOut",
            "type": "int256"
          },
          {
            "internalType": "uint160",
            "name": "priceAfter",
            "type": "uint160"
          }
        ],
        "internalType": "struct PoolsharkStructs.QuoteResults[]",
        "name": "results",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "pools",
        "type": "address[]"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint128",
            "name": "burnPercent",
            "type": "uint128"
          },
          {
            "internalType": "uint32",
            "name": "positionId",
            "type": "uint32"
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
        "internalType": "struct PoolsharkStructs.SnapshotLimitParams[]",
        "name": "params",
        "type": "tuple[]"
      }
    ],
    "name": "multiSnapshotLimit",
    "outputs": [
      {
        "internalType": "uint128[]",
        "name": "amountIns",
        "type": "uint128[]"
      },
      {
        "internalType": "uint128[]",
        "name": "amountOuts",
        "type": "uint128[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "pools",
        "type": "address[]"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint160",
            "name": "priceLimit",
            "type": "uint160"
          },
          {
            "internalType": "uint128",
            "name": "amount",
            "type": "uint128"
          },
          {
            "internalType": "bool",
            "name": "exactIn",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "zeroForOne",
            "type": "bool"
          },
          {
            "internalType": "bytes",
            "name": "callbackData",
            "type": "bytes"
          }
        ],
        "internalType": "struct PoolsharkStructs.SwapParams",
        "name": "params",
        "type": "tuple"
      },
      {
        "internalType": "uint160",
        "name": "exchangeRateLimit",
        "type": "uint160"
      },
      {
        "internalType": "uint32",
        "name": "deadline",
        "type": "uint32"
      }
    ],
    "name": "multiSwapSplit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "wethAddress",
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
    "stateMutability": "payable",
    "type": "receive"
  }
]