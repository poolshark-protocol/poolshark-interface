/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import type { Provider, Wallet, AbstractAddress } from "fuels";
import { Interface, Contract } from "fuels";
import type { AmmAbi, AmmAbiInterface } from "../AmmAbi";
const _abi = [
  {
    type: "function",
    name: "swap",
    inputs: [
      {
        type: "enum Identity",
        name: "recipient",
        components: [
          {
            type: "struct Address",
            name: "Address",
            components: [
              {
                type: "b256",
                name: "value",
              },
            ],
          },
          {
            type: "struct ContractId",
            name: "ContractId",
            components: [
              {
                type: "b256",
                name: "value",
              },
            ],
          },
        ],
      },
      {
        type: "bool",
        name: "token_zero_to_one",
      },
      {
        type: "u64",
        name: "amount",
      },
      {
        type: "struct Q64x64",
        name: "sprtPriceLimit",
        components: [
          {
            type: "struct U128",
            name: "value",
            components: [
              {
                type: "u64",
                name: "upper",
              },
              {
                type: "u64",
                name: "lower",
              },
            ],
          },
        ],
      },
    ],
    outputs: [
      {
        type: "u64",
        name: "",
      },
    ],
  },
  {
    type: "function",
    name: "quote_amount_in",
    inputs: [
      {
        type: "bool",
        name: "token_zero_to_one",
      },
      {
        type: "u64",
        name: "amount_out",
      },
    ],
    outputs: [
      {
        type: "u64",
        name: "",
      },
    ],
  },
  {
    type: "function",
    name: "set_price",
    inputs: [
      {
        type: "struct Q64x64",
        name: "price",
        components: [
          {
            type: "struct U128",
            name: "value",
            components: [
              {
                type: "u64",
                name: "upper",
              },
              {
                type: "u64",
                name: "lower",
              },
            ],
          },
        ],
      },
    ],
    outputs: [
      {
        type: "()",
        name: "",
        components: [],
      },
    ],
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      {
        type: "struct I24",
        name: "lower_old",
        components: [
          {
            type: "u32",
            name: "underlying",
          },
        ],
      },
      {
        type: "struct I24",
        name: "lower",
        components: [
          {
            type: "u32",
            name: "underlying",
          },
        ],
      },
      {
        type: "struct I24",
        name: "upper_old",
        components: [
          {
            type: "u32",
            name: "underlying",
          },
        ],
      },
      {
        type: "struct I24",
        name: "upper",
        components: [
          {
            type: "u32",
            name: "underlying",
          },
        ],
      },
      {
        type: "u64",
        name: "amount0_desired",
      },
      {
        type: "u64",
        name: "amount1_desired",
      },
    ],
    outputs: [
      {
        type: "struct U128",
        name: "",
        components: [
          {
            type: "u64",
            name: "upper",
          },
          {
            type: "u64",
            name: "lower",
          },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "burn",
    inputs: [
      {
        type: "struct I24",
        name: "lower",
        components: [
          {
            type: "u32",
            name: "underlying",
          },
        ],
      },
      {
        type: "struct I24",
        name: "upper",
        components: [
          {
            type: "u32",
            name: "underlying",
          },
        ],
      },
      {
        type: "struct U128",
        name: "liquidity_amount",
        components: [
          {
            type: "u64",
            name: "upper",
          },
          {
            type: "u64",
            name: "lower",
          },
        ],
      },
    ],
    outputs: [
      {
        type: "(_, _, _, _)",
        name: "",
        components: [
          {
            type: "u64",
            name: "__tuple_element",
          },
          {
            type: "u64",
            name: "__tuple_element",
          },
          {
            type: "u64",
            name: "__tuple_element",
          },
          {
            type: "u64",
            name: "__tuple_element",
          },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "collect_protocol_fee",
    inputs: [],
    outputs: [
      {
        type: "(_, _)",
        name: "",
        components: [
          {
            type: "u64",
            name: "__tuple_element",
          },
          {
            type: "u64",
            name: "__tuple_element",
          },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "collect",
    inputs: [
      {
        type: "struct I24",
        name: "tick_lower",
        components: [
          {
            type: "u32",
            name: "underlying",
          },
        ],
      },
      {
        type: "struct I24",
        name: "tick_upper",
        components: [
          {
            type: "u32",
            name: "underlying",
          },
        ],
      },
    ],
    outputs: [
      {
        type: "(_, _)",
        name: "",
        components: [
          {
            type: "u64",
            name: "__tuple_element",
          },
          {
            type: "u64",
            name: "__tuple_element",
          },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "get_price_and_nearest_tick",
    inputs: [],
    outputs: [
      {
        type: "(_, _)",
        name: "",
        components: [
          {
            type: "struct Q64x64",
            name: "__tuple_element",
            components: [
              {
                type: "struct U128",
                name: "value",
                components: [
                  {
                    type: "u64",
                    name: "upper",
                  },
                  {
                    type: "u64",
                    name: "lower",
                  },
                ],
              },
            ],
          },
          {
            type: "struct I24",
            name: "__tuple_element",
            components: [
              {
                type: "u32",
                name: "underlying",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "get_protocol_fees",
    inputs: [],
    outputs: [
      {
        type: "(_, _)",
        name: "",
        components: [
          {
            type: "u64",
            name: "__tuple_element",
          },
          {
            type: "u64",
            name: "__tuple_element",
          },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "get_reserves",
    inputs: [],
    outputs: [
      {
        type: "(_, _)",
        name: "",
        components: [
          {
            type: "u64",
            name: "__tuple_element",
          },
          {
            type: "u64",
            name: "__tuple_element",
          },
        ],
      },
    ],
  },
];

export class AmmAbi__factory {
  static readonly abi = _abi;
  static createInterface(): AmmAbiInterface {
    return new Interface(_abi) as unknown as AmmAbiInterface;
  }
  static connect(
    id: string | AbstractAddress,
    walletOrProvider: Wallet | Provider
  ): AmmAbi {
    return new Contract(id, _abi, walletOrProvider) as unknown as AmmAbi;
  }
}
