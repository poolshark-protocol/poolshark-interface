export const bondTellerABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "protocol_",
          "type": "address"
        },
        {
          "internalType": "contract IBondAggregator",
          "name": "aggregator_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "guardian_",
          "type": "address"
        },
        {
          "internalType": "contract Authority",
          "name": "authority_",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "CreateFail",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Teller_InvalidCallback",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Teller_InvalidParams",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Teller_NotAuthorized",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "contract ERC20",
          "name": "underlying",
          "type": "address"
        },
        {
          "internalType": "uint48",
          "name": "expiry",
          "type": "uint48"
        }
      ],
      "name": "Teller_TokenDoesNotExist",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint48",
          "name": "maturesOn",
          "type": "uint48"
        }
      ],
      "name": "Teller_TokenNotMatured",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Teller_UnsupportedToken",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "contract Authority",
          "name": "newAuthority",
          "type": "address"
        }
      ],
      "name": "AuthorityUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "referrer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "payout",
          "type": "uint256"
        }
      ],
      "name": "Bonded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract ERC20BondToken",
          "name": "bondToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "contract ERC20",
          "name": "underlying",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint48",
          "name": "expiry",
          "type": "uint48"
        }
      ],
      "name": "ERC20BondTokenCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnerUpdated",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "FEE_DECIMALS",
      "outputs": [
        {
          "internalType": "uint48",
          "name": "",
          "type": "uint48"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "authority",
      "outputs": [
        {
          "internalType": "contract Authority",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bondTokenImplementation",
      "outputs": [
        {
          "internalType": "contract ERC20BondToken",
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
          "internalType": "contract ERC20",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint48",
          "name": "",
          "type": "uint48"
        }
      ],
      "name": "bondTokens",
      "outputs": [
        {
          "internalType": "contract ERC20BondToken",
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
          "internalType": "contract ERC20[]",
          "name": "tokens_",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "to_",
          "type": "address"
        }
      ],
      "name": "claimFees",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract ERC20",
          "name": "underlying_",
          "type": "address"
        },
        {
          "internalType": "uint48",
          "name": "expiry_",
          "type": "uint48"
        },
        {
          "internalType": "uint256",
          "name": "amount_",
          "type": "uint256"
        }
      ],
      "name": "create",
      "outputs": [
        {
          "internalType": "contract ERC20BondToken",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "createFeeDiscount",
      "outputs": [
        {
          "internalType": "uint48",
          "name": "",
          "type": "uint48"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract ERC20",
          "name": "underlying_",
          "type": "address"
        },
        {
          "internalType": "uint48",
          "name": "expiry_",
          "type": "uint48"
        }
      ],
      "name": "deploy",
      "outputs": [
        {
          "internalType": "contract ERC20BondToken",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract ERC20",
          "name": "underlying_",
          "type": "address"
        },
        {
          "internalType": "uint48",
          "name": "expiry_",
          "type": "uint48"
        }
      ],
      "name": "getBondToken",
      "outputs": [
        {
          "internalType": "contract ERC20BondToken",
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
          "name": "id_",
          "type": "uint256"
        }
      ],
      "name": "getBondTokenForMarket",
      "outputs": [
        {
          "internalType": "contract ERC20BondToken",
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
          "name": "referrer_",
          "type": "address"
        }
      ],
      "name": "getFee",
      "outputs": [
        {
          "internalType": "uint48",
          "name": "",
          "type": "uint48"
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
      "name": "protocolFee",
      "outputs": [
        {
          "internalType": "uint48",
          "name": "",
          "type": "uint48"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "referrer_",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "id_",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount_",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minAmountOut_",
          "type": "uint256"
        }
      ],
      "name": "purchase",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint48",
          "name": "",
          "type": "uint48"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract ERC20BondToken",
          "name": "token_",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount_",
          "type": "uint256"
        }
      ],
      "name": "redeem",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "referrerFees",
      "outputs": [
        {
          "internalType": "uint48",
          "name": "",
          "type": "uint48"
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
          "internalType": "contract ERC20",
          "name": "",
          "type": "address"
        }
      ],
      "name": "rewards",
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
          "internalType": "contract Authority",
          "name": "newAuthority",
          "type": "address"
        }
      ],
      "name": "setAuthority",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint48",
          "name": "discount_",
          "type": "uint48"
        }
      ],
      "name": "setCreateFeeDiscount",
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
      "name": "setOwner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint48",
          "name": "fee_",
          "type": "uint48"
        }
      ],
      "name": "setProtocolFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint48",
          "name": "fee_",
          "type": "uint48"
        }
      ],
      "name": "setReferrerFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]