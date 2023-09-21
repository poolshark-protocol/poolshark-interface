export const limitPoolFactoryABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "FeeTierNotSupported",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTokenAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OwnerOnly",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PoolAlreadyExists",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PoolTypeNotSupported",
    "type": "error"
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
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "poolType",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "token0",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "token1",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint16",
        "name": "swapFee",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "int16",
        "name": "tickSpacing",
        "type": "int16"
      }
    ],
    "name": "PoolCreated",
    "type": "event"
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
            "internalType": "uint160",
            "name": "startPrice",
            "type": "uint160"
          },
          {
            "internalType": "uint16",
            "name": "swapFee",
            "type": "uint16"
          }
        ],
        "internalType": "struct PoolsharkStructs.LimitPoolParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "createLimitPool",
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
            "internalType": "uint160",
            "name": "startPrice",
            "type": "uint160"
          },
          {
            "internalType": "uint16",
            "name": "swapFee",
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
          }
        ],
        "internalType": "struct RangePoolStructs.MintRangeParams[]",
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
          }
        ],
        "internalType": "struct LimitPoolStructs.MintLimitParams[]",
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
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
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
        "name": "swapFee",
        "type": "uint16"
      }
    ],
    "name": "getLimitPool",
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
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "original",
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
    "name": "owner",
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
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "pools",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]