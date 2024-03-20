export const auctioneerABI = [
  {
    inputs: [
      {
        internalType: "contract IBondTeller",
        name: "teller_",
        type: "address",
      },
      {
        internalType: "contract IBondAggregator",
        name: "aggregator_",
        type: "address",
      },
      {
        internalType: "address",
        name: "guardian_",
        type: "address",
      },
      {
        internalType: "contract Authority",
        name: "authority_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "Auctioneer_AmountLessThanMinimum",
    type: "error",
  },
  {
    inputs: [],
    name: "Auctioneer_BadExpiry",
    type: "error",
  },
  {
    inputs: [],
    name: "Auctioneer_InvalidCallback",
    type: "error",
  },
  {
    inputs: [],
    name: "Auctioneer_InvalidParams",
    type: "error",
  },
  {
    inputs: [],
    name: "Auctioneer_MarketNotActive",
    type: "error",
  },
  {
    inputs: [],
    name: "Auctioneer_MaxPayoutExceeded",
    type: "error",
  },
  {
    inputs: [],
    name: "Auctioneer_NewMarketsNotAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "Auctioneer_NotAuthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "Auctioneer_NotEnoughCapacity",
    type: "error",
  },
  {
    inputs: [],
    name: "Auctioneer_OnlyMarketOwner",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "contract Authority",
        name: "newAuthority",
        type: "address",
      },
    ],
    name: "AuthorityUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "MarketClosed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payoutToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "quoteToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint48",
        name: "vesting",
        type: "uint48",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fixedPrice",
        type: "uint256",
      },
    ],
    name: "MarketCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnerUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "allowNewMarkets",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "authority",
    outputs: [
      {
        internalType: "contract Authority",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "callbackAuthorized",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "closeMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "params_",
        type: "bytes",
      },
    ],
    name: "createMarket",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "currentCapacity",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAggregator",
    outputs: [
      {
        internalType: "contract IBondAggregator",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "getMarketInfoForPurchase",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "callbackAddr",
        type: "address",
      },
      {
        internalType: "contract ERC20",
        name: "payoutToken",
        type: "address",
      },
      {
        internalType: "contract ERC20",
        name: "quoteToken",
        type: "address",
      },
      {
        internalType: "uint48",
        name: "vesting",
        type: "uint48",
      },
      {
        internalType: "uint256",
        name: "maxPayout_",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTeller",
    outputs: [
      {
        internalType: "contract IBondTeller",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "isInstantSwap",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "isLive",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "marketPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "marketScale",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "markets",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "contract ERC20",
        name: "payoutToken",
        type: "address",
      },
      {
        internalType: "contract ERC20",
        name: "quoteToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "callbackAddr",
        type: "address",
      },
      {
        internalType: "bool",
        name: "capacityInQuote",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "capacity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxPayout",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "scale",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "sold",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "purchased",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "referrer_",
        type: "address",
      },
    ],
    name: "maxAmountAccepted",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "maxPayout",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minDepositInterval",
    outputs: [
      {
        internalType: "uint48",
        name: "",
        type: "uint48",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minMarketDuration",
    outputs: [
      {
        internalType: "uint48",
        name: "",
        type: "uint48",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "newOwners",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "referrer_",
        type: "address",
      },
    ],
    name: "payoutFor",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
    ],
    name: "pullOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minAmountOut_",
        type: "uint256",
      },
    ],
    name: "purchaseBond",
    outputs: [
      {
        internalType: "uint256",
        name: "payout",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "newOwner_",
        type: "address",
      },
    ],
    name: "pushOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "status_",
        type: "bool",
      },
    ],
    name: "setAllowNewMarkets",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract Authority",
        name: "newAuthority",
        type: "address",
      },
    ],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creator_",
        type: "address",
      },
      {
        internalType: "bool",
        name: "status_",
        type: "bool",
      },
    ],
    name: "setCallbackAuthStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32[6]",
        name: "defaults_",
        type: "uint32[6]",
      },
    ],
    name: "setDefaults",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id_",
        type: "uint256",
      },
      {
        internalType: "uint32[3]",
        name: "intervals_",
        type: "uint32[3]",
      },
    ],
    name: "setIntervals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint48",
        name: "depositInterval_",
        type: "uint48",
      },
    ],
    name: "setMinDepositInterval",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint48",
        name: "duration_",
        type: "uint48",
      },
    ],
    name: "setMinMarketDuration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "setOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "terms",
    outputs: [
      {
        internalType: "uint48",
        name: "start",
        type: "uint48",
      },
      {
        internalType: "uint48",
        name: "conclusion",
        type: "uint48",
      },
      {
        internalType: "uint48",
        name: "vesting",
        type: "uint48",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
