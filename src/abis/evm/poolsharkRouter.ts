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
              "internalType": "uint256",
              "name": "amountIn",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountOut",
              "type": "uint256"
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
      "name": "multiSwapSplit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]