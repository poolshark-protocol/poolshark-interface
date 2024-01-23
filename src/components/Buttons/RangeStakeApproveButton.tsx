import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
    useSigner,
  } from "wagmi";
  import React, { useState } from "react";
  import { BN_ZERO } from "../../utils/math/constants";
  import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
  import { BigNumber, ethers } from "ethers";
  import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
  import Loader from "../Icons/Loader";
  import { useConfigStore } from "../../hooks/useConfigStore";
  
  export default function RangeStakeButton({
  }) {
    return (
      <>
        <button
          className="bg-green-800/20 whitespace-nowrap border w-full border-green-500/50 text-green-500 transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px]"
        >
          Approve Stake
        </button>
      </>
    );
  }
  