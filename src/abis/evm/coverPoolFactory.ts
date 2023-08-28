export const coverPoolFactoryABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "CurveMathNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FeeTierNotSupported",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTickSpread",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTokenAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTokenDecimals",
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
    "name": "PoolTypeNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TickSpreadNotAtLeastDoubleTickSpread",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TickSpreadNotMultipleOfTickSpacing",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VolatilityTierNotSupported",
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
        "indexed": true,
        "internalType": "address",
        "name": "twapSource",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "inputPool",
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
        "indexed": true,
        "internalType": "address",
        "name": "poolImpl",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "fee",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "int16",
        "name": "tickSpread",
        "type": "int16"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "twapLength",
        "type": "uint16"
      }
    ],
    "name": "PoolCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "coverPools",
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
      }
    ],
    "name": "createCoverPool",
    "outputs": [
      {
        "internalType": "address",
        "name": "pool",
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
      }
    ],
    "name": "getCoverPool",
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
  }
]