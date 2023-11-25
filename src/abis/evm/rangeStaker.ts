export const rangeStakerABI = [
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "limitPoolFactory",
              "type": "address"
            },
            {
              "internalType": "uint32",
              "name": "startTime",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "endTime",
              "type": "uint32"
            }
          ],
          "internalType": "struct RangeStaker.RangeStakerParams",
          "name": "params",
          "type": "tuple"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousFeeTo",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newFeeTo",
          "type": "address"
        }
      ],
      "name": "FeeToTransfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnerTransfer",
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
          "internalType": "uint32",
          "name": "positionId",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "feeGrowthInside0Last",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "feeGrowthInside1Last",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint128",
          "name": "liquidity",
          "type": "uint128"
        }
      ],
      "name": "StakeRange",
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
          "internalType": "uint32",
          "name": "positionId",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "feeGrowth0Accrued",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "feeGrowth1Accrued",
          "type": "uint256"
        }
      ],
      "name": "StakeRangeAccrued",
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
          "internalType": "uint32",
          "name": "positionId",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "uint128",
          "name": "newLiquidity",
          "type": "uint128"
        }
      ],
      "name": "StakeRangeBurn",
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
          "internalType": "uint32",
          "name": "positionId",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "UnstakeRange",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint32",
              "name": "positionId",
              "type": "uint32"
            },
            {
              "internalType": "uint128",
              "name": "burnPercent",
              "type": "uint128"
            }
          ],
          "internalType": "struct PoolsharkStructs.BurnRangeParams",
          "name": "params",
          "type": "tuple"
        }
      ],
      "name": "burnRangeStake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "endTimestamp",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
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
      "name": "rangeStakes",
      "outputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "feeGrowthInside0Last",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "feeGrowthInside1Last",
          "type": "uint256"
        },
        {
          "internalType": "uint128",
          "name": "feeGrowth0Accrued",
          "type": "uint128"
        },
        {
          "internalType": "uint128",
          "name": "feeGrowth1Accrued",
          "type": "uint128"
        },
        {
          "internalType": "uint128",
          "name": "liquidity",
          "type": "uint128"
        },
        {
          "internalType": "uint32",
          "name": "positionId",
          "type": "uint32"
        },
        {
          "internalType": "bool",
          "name": "isStaked",
          "type": "bool"
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
      "name": "rewardDistributions",
      "outputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint160",
          "name": "averageSqrtPrice",
          "type": "uint160"
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
      "name": "rewardsClaimed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
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
              "internalType": "address",
              "name": "pool",
              "type": "address"
            },
            {
              "internalType": "uint32",
              "name": "positionId",
              "type": "uint32"
            },
            {
              "internalType": "bool",
              "name": "isMint",
              "type": "bool"
            }
          ],
          "internalType": "struct PoolsharkStructs.StakeRangeParams",
          "name": "params",
          "type": "tuple"
        }
      ],
      "name": "stakeRange",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "startTimestamp",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "totalStakes",
      "outputs": [
        {
          "internalType": "uint128",
          "name": "feeGrowth0AccruedTotal",
          "type": "uint128"
        },
        {
          "internalType": "uint128",
          "name": "feeGrowth1AccruedTotal",
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
          "name": "newFeeTo",
          "type": "address"
        }
      ],
      "name": "transferFeeTo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwner",
      "outputs": [],
      "stateMutability": "nonpayable",
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
              "internalType": "address",
              "name": "pool",
              "type": "address"
            },
            {
              "internalType": "uint32",
              "name": "positionId",
              "type": "uint32"
            }
          ],
          "internalType": "struct PoolsharkStructs.UnstakeRangeParams",
          "name": "params",
          "type": "tuple"
        }
      ],
      "name": "unstakeRange",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
]