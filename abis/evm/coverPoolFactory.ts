export const coverPoolFactoryABI = [
  {
    "inputs": [
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
    "name": "IdenticalTokenAddresses",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTickSpread",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTokenDecimals",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PoolAlreadyExists",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
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
        "internalType": "uint24",
        "name": "fee",
        "type": "uint24"
      },
      {
        "indexed": false,
        "internalType": "int24",
        "name": "tickSpread",
        "type": "int24"
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
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "pool",
        "type": "address"
      }
    ],
    "name": "PoolCreated",
    "type": "event"
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
      },
      {
        "internalType": "uint16",
        "name": "auctionLength",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "feeTierTickSpacing",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
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
      },
      {
        "internalType": "uint16",
        "name": "auctionLength",
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
    "name": "libraries",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "poolList",
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
    "name": "poolMapping",
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