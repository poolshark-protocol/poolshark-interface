export const rangePoolABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_token0",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_token1",
          "type": "address"
        },
        {
          "internalType": "int24",
          "name": "_tickSpacing",
          "type": "int24"
        },
        {
          "internalType": "uint16",
          "name": "_swapFee",
          "type": "uint16"
        },
        {
          "internalType": "uint160",
          "name": "_startPrice",
          "type": "uint160"
        },
        {
          "internalType": "contract IRangePoolManager",
          "name": "_owner",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "BurnExceedsBalance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "BurnFromAddress0",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ERC1155NotSupported",
      "type": "error"
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "accountsLength",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "idsLength",
          "type": "uint256"
        }
      ],
      "name": "LengthMismatch",
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
      "name": "MintToAddress0",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotEnoughOutputLiquidity",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OwnerOnly",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "RangeErc20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "RangeErc20NotFound",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "SelfApproval",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "SpenderNotApproved",
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
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TransferExceedsBalance",
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
      "name": "TransferFromOrToAddress0",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransferToSelf",
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
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approve",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
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
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        }
      ],
      "name": "TransferBatch",
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
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TransferSingle",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "balanceOf",
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
          "internalType": "address[]",
          "name": "_accounts",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "_ids",
          "type": "uint256[]"
        }
      ],
      "name": "balanceOfBatch",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "batchBalances",
          "type": "uint256[]"
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
              "name": "fungible",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "collect",
              "type": "bool"
            }
          ],
          "internalType": "struct IRangePoolStructs.BurnParams",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "_account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "burnFungible",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_spender",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
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
              "internalType": "bool",
              "name": "fungible",
              "type": "bool"
            }
          ],
          "internalType": "struct IRangePoolStructs.MintParams",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "_account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "mintFungible",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "contract IRangePoolManager",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "poolState",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "unlocked",
          "type": "uint8"
        },
        {
          "internalType": "int24",
          "name": "nearestTick",
          "type": "int24"
        },
        {
          "internalType": "uint32",
          "name": "observationIndex",
          "type": "uint32"
        },
        {
          "internalType": "uint128",
          "name": "liquidity",
          "type": "uint128"
        },
        {
          "internalType": "uint128",
          "name": "liquidityGlobal",
          "type": "uint128"
        },
        {
          "internalType": "uint160",
          "name": "price",
          "type": "uint160"
        },
        {
          "internalType": "uint160",
          "name": "secondsGrowthGlobal",
          "type": "uint160"
        },
        {
          "internalType": "uint216",
          "name": "feeGrowthGlobal0",
          "type": "uint216"
        },
        {
          "internalType": "uint216",
          "name": "feeGrowthGlobal1",
          "type": "uint216"
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
          "internalType": "struct IRangePoolStructs.ProtocolFees",
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
      "name": "positions",
      "outputs": [
        {
          "internalType": "uint128",
          "name": "liquidity",
          "type": "uint128"
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
          "internalType": "uint256",
          "name": "feeGrowthInside0Last",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "feeGrowthInside1Last",
          "type": "uint256"
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
          "components": [
            {
              "internalType": "uint8",
              "name": "unlocked",
              "type": "uint8"
            },
            {
              "internalType": "int24",
              "name": "nearestTick",
              "type": "int24"
            },
            {
              "internalType": "uint32",
              "name": "observationIndex",
              "type": "uint32"
            },
            {
              "internalType": "uint128",
              "name": "liquidity",
              "type": "uint128"
            },
            {
              "internalType": "uint128",
              "name": "liquidityGlobal",
              "type": "uint128"
            },
            {
              "internalType": "uint160",
              "name": "price",
              "type": "uint160"
            },
            {
              "internalType": "uint160",
              "name": "secondsGrowthGlobal",
              "type": "uint160"
            },
            {
              "internalType": "uint216",
              "name": "feeGrowthGlobal0",
              "type": "uint216"
            },
            {
              "internalType": "uint216",
              "name": "feeGrowthGlobal1",
              "type": "uint216"
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
              "internalType": "struct IRangePoolStructs.ProtocolFees",
              "name": "protocolFees",
              "type": "tuple"
            }
          ],
          "internalType": "struct IRangePoolStructs.PoolState",
          "name": "",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "bool",
              "name": "cross",
              "type": "bool"
            },
            {
              "internalType": "int24",
              "name": "crossTick",
              "type": "int24"
            },
            {
              "internalType": "uint16",
              "name": "swapFee",
              "type": "uint16"
            },
            {
              "internalType": "uint16",
              "name": "protocolFee",
              "type": "uint16"
            },
            {
              "internalType": "uint256",
              "name": "input",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "output",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountIn",
              "type": "uint256"
            }
          ],
          "internalType": "struct IRangePoolStructs.SwapCache",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "_ids",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "_amounts",
          "type": "uint256[]"
        }
      ],
      "name": "safeBatchTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_spender",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "_interfaceId",
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
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "swapFee",
      "outputs": [
        {
          "internalType": "uint16",
          "name": "",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "pure",
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
      "inputs": [],
      "name": "tickSpacing",
      "outputs": [
        {
          "internalType": "int24",
          "name": "",
          "type": "int24"
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
      "name": "ticks",
      "outputs": [
        {
          "internalType": "int128",
          "name": "liquidityDelta",
          "type": "int128"
        },
        {
          "internalType": "uint216",
          "name": "feeGrowthOutside0",
          "type": "uint216"
        },
        {
          "internalType": "uint216",
          "name": "feeGrowthOutside1",
          "type": "uint216"
        },
        {
          "internalType": "uint160",
          "name": "secondsGrowthOutside",
          "type": "uint160"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
]