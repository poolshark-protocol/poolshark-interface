export const rangePoolSamplesABI = [
  {
    "inputs": [],
    "name": "InvalidSampleLength",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SampleArrayUninitialized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SampleLengthNotAvailable",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "sampleLengthNext",
        "type": "uint16"
      }
    ],
    "name": "SampleLengthIncreased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "int56",
        "name": "tickSecondsAccum",
        "type": "int56"
      },
      {
        "indexed": false,
        "internalType": "uint160",
        "name": "secondsPerLiquidityAccum",
        "type": "uint160"
      }
    ],
    "name": "SampleRecorded",
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
            "internalType": "uint16",
            "name": "sampleIndex",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "sampleLength",
            "type": "uint16"
          },
          {
            "internalType": "uint32",
            "name": "time",
            "type": "uint32"
          },
          {
            "internalType": "uint32[]",
            "name": "secondsAgos",
            "type": "uint32[]"
          },
          {
            "internalType": "int24",
            "name": "tick",
            "type": "int24"
          },
          {
            "internalType": "uint128",
            "name": "liquidity",
            "type": "uint128"
          }
        ],
        "internalType": "struct IRangePoolStructs.SampleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "get",
    "outputs": [
      {
        "internalType": "int56[]",
        "name": "tickSecondsAccum",
        "type": "int56[]"
      },
      {
        "internalType": "uint160[]",
        "name": "secondsPerLiquidityAccum",
        "type": "uint160[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IRangePool",
        "name": "pool",
        "type": "IRangePool"
      },
      {
        "components": [
          {
            "internalType": "uint16",
            "name": "sampleIndex",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "sampleLength",
            "type": "uint16"
          },
          {
            "internalType": "uint32",
            "name": "time",
            "type": "uint32"
          },
          {
            "internalType": "uint32[]",
            "name": "secondsAgos",
            "type": "uint32[]"
          },
          {
            "internalType": "int24",
            "name": "tick",
            "type": "int24"
          },
          {
            "internalType": "uint128",
            "name": "liquidity",
            "type": "uint128"
          }
        ],
        "internalType": "struct IRangePoolStructs.SampleParams",
        "name": "params",
        "type": "tuple"
      },
      {
        "internalType": "uint32",
        "name": "secondsAgo",
        "type": "uint32"
      }
    ],
    "name": "getSingle",
    "outputs": [
      {
        "internalType": "int56",
        "name": "tickSecondsAccum",
        "type": "int56"
      },
      {
        "internalType": "uint160",
        "name": "secondsPerLiquidityAccum",
        "type": "uint160"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]