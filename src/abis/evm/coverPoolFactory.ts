export const coverPoolFactoryABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_rangePoolFactory",
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
    "name": "InvalidTickSpread",
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
        "indexed": false,
        "internalType": "address",
        "name": "inputPool",
        "type": "address"
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
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "auctionLength",
        "type": "uint16"
      }
    ],
    "name": "PoolCreated",
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
        "internalType": "uint128",
        "name": "token0Fees",
        "type": "uint128"
      },
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "token1Fees",
        "type": "uint128"
      }
    ],
    "name": "ProtocolFeeCollected",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "collectPool",
        "type": "address"
      }
    ],
    "name": "collectProtocolFees",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "internalType": "address",
        "name": "fromToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "destToken",
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
        "internalType": "address",
        "name": "fromToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "destToken",
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
  },
  {
    "inputs": [],
    "name": "rangePoolFactory",
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