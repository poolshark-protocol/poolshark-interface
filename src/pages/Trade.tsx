import { useState, useEffect, Fragment } from "react";
import { erc20ABI, useAccount, useContractRead, useBalance } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { chainProperties } from "../utils/chains";
import { ZERO_ADDRESS } from "../utils/math/constants";
import { getLimitTokenUsdPrice } from "../utils/tokens";
import { poolsharkRouterABI } from "../abis/evm/poolsharkRouter";
import { useTradeStore } from "../hooks/useTradeStore";
import { fetchLimitPositions } from "../utils/queries";
import { useSwitchNetwork } from "wagmi";
import { useToken } from "wagmi";
import { useRouter } from "next/router";
import {
  getClaimTick,
  mapUserHistoricalOrders,
  mapUserLimitPositions,
} from "../utils/maps";
import { timeDifference } from "../utils/time";
import { parseUnits } from "../utils/math/valueMath";
import UserLimitPool from "../components/Limit/UserLimitPool";
import { useConfigStore } from "../hooks/useConfigStore";
import MarketSwap from "../components/Trade/MarketSwap";
import LimitSwap from "../components/Trade/LimitSwap";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import inputFilter from "../utils/inputFilter";
import { addressMatches, getRouterAddress, isWeth } from "../utils/config";
import { Network } from "alchemy-sdk";
import { deepConvertBigIntAndBigNumber } from "../utils/misc";

export default function Trade() {
  const { address, isDisconnected, isConnected } = useAccount();

  const [
    chainId,
    networkName,
    limitSubgraph,
    setLimitSubgraph,
    logoMap,
    setDisplayTokenList,
    setNetworkName,
    setChainId,
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
    state.limitSubgraph,
    state.setLimitSubgraph,
    state.logoMap,
    state.setDisplayTokenList,
    state.setNetworkName,
    state.setChainId,
  ]);

  const [
    tradePoolData,
    setTradePoolData,
    tradeButton,
    pairSelected,
    limitTabSelected,
    setPairSelected,
    wethCall,
    startPrice,
    tradeSlippage,
    setTradeSlippage,
    tokenIn,
    setTokenIn,
    setTokenInBalance,
    setTokenInTradeAllowance,
    setTokenInTradeUSDPrice,
    tokenOut,
    setTokenOut,
    setTokenOutBalance,
    setTokenOutTradeUSDPrice,
    amountIn,
    setAmountIn,
    amountOut,
    setAmountOut,
    needsAllowanceIn,
    setNeedsAllowanceIn,
    needsAllowanceOut,
    setNeedsAllowanceOut,
    needsBalanceIn,
    setNeedsBalanceIn,
    needsBalanceOut,
    setNeedsBalanceOut,
    limitPriceString,
    setLimitPriceString,
    switchDirection,
    setTradeButtonState,
    needsRefetch,
    setNeedsRefetch,
    needsPosRefetch,
    setNeedsPosRefetch,
    needsSnapshot,
    setNeedsSnapshot,
    setStartPrice,
    setLimitTabSelected,
  ] = useTradeStore((s) => [
    s.tradePoolData,
    s.setTradePoolData,
    s.tradeButton,
    s.pairSelected,
    s.limitTabSelected,
    s.setPairSelected,
    s.wethCall,
    s.startPrice,
    s.tradeSlippage,
    s.setTradeSlippage,
    s.tokenIn,
    s.setTokenIn,
    s.setTokenInBalance,
    s.setTokenInTradeAllowance,
    s.setTokenInTradeUSDPrice,
    s.tokenOut,
    s.setTokenOut,
    s.setTokenOutBalance,
    s.setTokenOutTradeUSDPrice,
    s.amountIn,
    s.setAmountIn,
    s.amountOut,
    s.setAmountOut,
    s.needsAllowanceIn,
    s.setNeedsAllowanceIn,
    s.needsAllowanceOut,
    s.setNeedsAllowanceOut,
    s.needsBalanceIn,
    s.setNeedsBalanceIn,
    s.needsBalanceOut,
    s.setNeedsBalanceOut,
    s.limitPriceString,
    s.setLimitPriceString,
    s.switchDirection,
    s.setTradeButtonState,
    s.needsRefetch,
    s.setNeedsRefetch,
    s.needsPosRefetch,
    s.setNeedsPosRefetch,
    s.needsSnapshot,
    s.setNeedsSnapshot,
    s.setStartPrice,
    s.setLimitTabSelected,
  ]);

  const { error: networkError, switchNetwork } = useSwitchNetwork({
    onSuccess(data) {},
  });

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  //false order history is selected, true when active orders is selected
  const [activeOrdersSelected, setActiveOrdersSelected] = useState(true);

  ////////////////////////////////Pools

  //log addresses and ids
  const [limitPoolAddressList, setLimitPoolAddressList] = useState([]);
  const [limitPositionSnapshotList, setLimitPositionSnapshotList] = useState<
    any[]
  >([]);

  //log amount in and out
  const [limitFilledAmountList, setLimitFilledAmountList] = useState([]);
  const [currentAmountOutList, setCurrentAmountOutList] = useState([]);

  const [tokenInInfo, setTokenInInfo] = useState(undefined);
  const [tokenOutInfo, setTokenOutInfo] = useState(undefined);

  useEffect(() => {
    if (
      tokenIn.address != ZERO_ADDRESS &&
      (tradePoolData?.id == ZERO_ADDRESS || tradePoolData?.id == undefined)
    ) {
      getLimitTokenUsdPrice(
        tokenIn.address,
        setTokenInTradeUSDPrice,
        limitSubgraph,
      );
    }
  }, [tokenIn.address]);

  useEffect(() => {
    if (
      tokenOut.address != ZERO_ADDRESS &&
      (tradePoolData?.id == ZERO_ADDRESS || tradePoolData?.id == undefined)
    ) {
      getLimitTokenUsdPrice(
        tokenOut.address,
        setTokenOutTradeUSDPrice,
        limitSubgraph,
      );
    }
  }, [tokenOut.address]);

  ////////////////////////////////Filled Amount
  const { data: filledAmountListInt } = useContractRead({
    address: getRouterAddress(networkName),
    abi: poolsharkRouterABI,
    functionName: "multiSnapshotLimit",
    args: [
      limitPoolAddressList,
      deepConvertBigIntAndBigNumber(limitPositionSnapshotList),
    ],
    chainId: chainId,
    watch: needsSnapshot,
    enabled:
      isConnected &&
      limitPoolAddressList.length > 0 &&
      needsSnapshot &&
      getRouterAddress(networkName),
    onSuccess(data) {
      // console.log("Success price filled amount", data);
      // console.log("snapshot address list", limitPoolAddressList);
      // console.log("snapshot params list", limitPositionSnapshotList);
      setNeedsSnapshot(false);
    },
    onError(error) {
      console.log("network check", networkName);
      console.log("Error price Limit", error);
    },
  });

  useEffect(() => {
    if (filledAmountListInt) {
      const filledAmountList =
        deepConvertBigIntAndBigNumber(filledAmountListInt);
      setLimitFilledAmountList(filledAmountList[0]);
      setCurrentAmountOutList(filledAmountList[1]);
    }
  }, [filledAmountListInt]);

  //////////////////////Position Data

  const [allLimitPositions, setAllLimitPositions] = useState([]);
  const [allHistoricalOrders, setAllHistoricalOrders] = useState([]);

  useEffect(() => {
    if (address) {
      const chainConstants = chainProperties[networkName]
        ? chainProperties[networkName]
        : chainProperties["arbitrum-one"];
      setLimitSubgraph(chainConstants["limitSubgraphUrl"]);
      getUserLimitPositionData();
      setNeedsRefetch(false);
    }
  }, [needsRefetch, needsPosRefetch, address, networkName]);

  useEffect(() => {
    if (allLimitPositions.length > 0) {
      mapUserLimitSnapshotList();
    }
  }, [allLimitPositions]);

  async function getUserLimitPositionData() {
    try {
      const data = await fetchLimitPositions(
        limitSubgraph,
        address?.toLowerCase(),
      );
      if (data["data"]) {
        setAllLimitPositions(
          mapUserLimitPositions(data["data"].limitPositions),
        );
        setAllHistoricalOrders(
          mapUserHistoricalOrders(data["data"].historicalOrders),
        );
      }
    } catch (error) {
      console.log("limit error", error);
    }
    setIsLoading(false);
  }

  async function mapUserLimitSnapshotList() {
    try {
      let mappedLimitPoolAddresses = [];
      let mappedLimitSnapshotParams = [];
      if (allLimitPositions.length > 0) {
        for (let i = 0; i < allLimitPositions.length; i++) {
          mappedLimitPoolAddresses[i] = allLimitPositions[i].poolId;
          mappedLimitSnapshotParams[i] = [];
          mappedLimitSnapshotParams[i][0] = address;
          mappedLimitSnapshotParams[i][1] = parseUnits("1", 38);
          mappedLimitSnapshotParams[i][2] = BigNumber.from(
            allLimitPositions[i].positionId,
          );
          mappedLimitSnapshotParams[i][3] = BigNumber.from(
            await getClaimTick(
              allLimitPositions[i].poolId.toString(),
              Number(allLimitPositions[i].min),
              Number(allLimitPositions[i].max),
              allLimitPositions[i].tokenIn.id.localeCompare(
                allLimitPositions[i].tokenOut.id,
              ) < 0,
              Number(allLimitPositions[i].epochLast),
              false,
              limitSubgraph,
              undefined,
            ),
          );
          mappedLimitSnapshotParams[i][4] =
            allLimitPositions[i].tokenIn.id.localeCompare(
              allLimitPositions[i].tokenOut.id,
            ) < 0;
        }
        setLimitPoolAddressList(mappedLimitPoolAddresses);
        setLimitPositionSnapshotList(mappedLimitSnapshotParams);
      }
    } catch (error) {
      console.log("limit error", error);
    }
  }

  ////////////////////////////////Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: tokenIn.native ? undefined : tokenIn.address,
    enabled: tokenIn.address != undefined && needsBalanceIn,
    watch: needsBalanceIn,
    chainId: chainId,
    onSuccess(data) {
      setNeedsBalanceIn(false);
      setTimeout(() => {
        setNeedsBalanceIn(true);
      }, 5000);
    },
  });

  const { data: tokenOutBal } = useBalance({
    address: address,
    token: tokenOut.native ? undefined : tokenOut.address,
    enabled: tokenOut.address != undefined && needsBalanceOut,
    watch: needsBalanceOut,
    chainId: chainId,
    onSuccess(data) {
      setNeedsBalanceOut(false);
      setTimeout(() => {
        setNeedsBalanceOut(true);
      }, 5000);
    },
  });

  useEffect(() => {
    if (isConnected && tokenInBal) {
      setTokenInBalance(
        !isNaN(parseFloat(tokenInBal?.formatted.toString()))
          ? tokenInBal?.formatted.toString()
          : "0.00",
      );
    }
    if (isConnected && tokenOutBal) {
      setTokenOutBalance(
        !isNaN(parseFloat(tokenOutBal?.formatted.toString()))
          ? tokenOutBal?.formatted.toString()
          : "0.00",
      );
    }
  }, [tokenInBal, tokenOutBal]);

  ////////////////////////////////Allowances

  const { data: allowanceInRouter, refetch: allowanceInRefetch } =
    useContractRead({
      address: tokenIn.address,
      abi: erc20ABI,
      functionName: "allowance",
      args: [address, getRouterAddress(networkName)],
      chainId: chainId,
      watch: true,
      enabled: tokenIn.address != ZERO_ADDRESS && !tokenIn.native,
      onError(error) {
        console.log("Error allowance", error);
      },
      onSuccess(data) {
        setNeedsAllowanceIn(false);
        // console.log("Success allowance", tokenIn.symbol, tokenIn.userRouterAllowance?.gte(amountIn));
      },
    });

  useEffect(() => {
    if (allowanceInRouter) {
      setTokenInTradeAllowance(
        deepConvertBigIntAndBigNumber(allowanceInRouter),
      );
    }
  }, [allowanceInRouter]);

  ///////////////////////
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    data: tokenInData,
    refetch: refetchTokenInInfo,
    isLoading: isTokenInLoading,
  } = useToken({
    address:
      (router.query.from as `0x${string}`) ?? (ZERO_ADDRESS as `0x${string}`),
    enabled: router.query.from != ZERO_ADDRESS,
    onSuccess() {
      if (tokenInData) {
        const newTokenIn = {
          ...tokenInData,
          native:
            router.query.fromSymbol ==
            chainProperties[networkName].nativeCurrency.symbol
              ? true
              : false,
          symbol: router.query.fromSymbol ?? tokenInData.symbol,
        };
        setTokenInInfo(newTokenIn);
      } else {
        refetchTokenInInfo();
      }
    },
  });

  const {
    data: tokenOutData,
    refetch: refetchTokenOutInfo,
    isLoading: isTokenOutLoading,
  } = useToken({
    address:
      (router.query.to as `0x${string}`) ?? (ZERO_ADDRESS as `0x${string}`),
    enabled: router.query.to != ZERO_ADDRESS,
    onSuccess() {
      if (tokenOutData) {
        const newTokenOut = {
          ...tokenOutData,
          native:
            router.query.toSymbol ==
            chainProperties[networkName].nativeCurrency.symbol
              ? true
              : false,
          symbol: router.query.toSymbol ?? tokenOutData.symbol,
        };
        setTokenOutInfo(newTokenOut);
      } else {
        refetchTokenOutInfo();
      }
    },
  });

  useEffect(() => {
    refetchTokenInInfo();
    refetchTokenOutInfo();
  }, [router.query]);

  const [updatedFromRouter, setUpdatedFromRouter] = useState(false);

  useEffect(() => {
    if (tokenInInfo && tokenOutInfo && !updatedFromRouter) {
      setTokenIn(tokenOutInfo, tokenInInfo, "0", false);
      setTokenOut(tokenInInfo, tokenOutInfo, "0", false);
      setUpdatedFromRouter(true);
    }
  }, [tokenInInfo, tokenOutInfo]);

  const updateRouter = () => {
    router.push({
      pathname: "/",
      query: {
        chain: chainId,
        from: tokenIn.address,
        fromSymbol: tokenIn.symbol,
        to: tokenOut.address,
        toSymbol: tokenOut.symbol,
      },
    });
  };

  useEffect(() => {
    if (
      tokenIn.symbol != tokenOut.symbol &&
      tokenIn.callId != 2 &&
      tokenOut.callId != 2 &&
      tokenIn.address != ZERO_ADDRESS &&
      tokenOut.address != ZERO_ADDRESS
    )
      updateRouter();
  }, [
    tokenIn.address,
    tokenIn.symbol,
    tokenOut.address,
    tokenOut.symbol,
    chainId,
  ]);

  return (
    <div className="min-h-[calc(100vh-160px)] w-[48rem] px-3 md:px-0">
      <div className="flex w-full mt-[10vh] justify-center mb-20 ">
        <div className="bg-black font-regular border border-grey rounded-[4px] w-full max-w-2xl">
          <div className="flex text-xs">
            <button
              onClick={() => setLimitTabSelected(false)}
              className={`w-full relative py-2.5 ${
                !limitTabSelected
                  ? "text-white"
                  : "text-white/50 border-b border-r border-grey"
              }`}
            >
              {!limitTabSelected && (
                <div className="h-0.5 w-full bg-main absolute top-[-1px]" />
              )}
              MARKET SWAP
            </button>
            <button
              onClick={() => setLimitTabSelected(true)}
              className={`w-full relative py-2.5 ${
                limitTabSelected
                  ? "text-white"
                  : "text-white/50 border-b border-l border-grey"
              }`}
            >
              {limitTabSelected && (
                <div className="h-0.5 w-full bg-main absolute top-[-1px]" />
              )}
              LIMIT SWAP
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-grey1">FROM</span>
              <div
                className="cursor-pointer"
                onClick={() => setIsSettingsOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 hover:opacity-60"
                >
                  <path d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.25 4.5a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM5 3.75a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM4.25 17a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM17.25 17a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM9 10a.75.75 0 01-.75.75h-5.5a.75.75 0 010-1.5h5.5A.75.75 0 019 10zM17.25 10.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM14 10a2 2 0 10-4 0 2 2 0 004 0zM10 16.25a2 2 0 10-4 0 2 2 0 004 0z" />
                </svg>
              </div>
            </div>
            {!limitTabSelected ? <MarketSwap /> : <LimitSwap />}
          </div>
        </div>
      </div>
      {/* from here is to stay on trade */}
      {!isDisconnected && (
        <div className="md:mb-20 mb-32 w-full">
          <div className="flex md:flex-row flex-col gap-y-3 item-end justify-between w-full">
            <h1 className="mt-1.5">Orders</h1>
            <div className="text-xs w-full md:w-auto flex">
              <button
                className={`px-5 py-2 w-full md:w-auto ${
                  !activeOrdersSelected
                    ? "bg-black border-l border-t border-b border-grey"
                    : "bg-main1 border border-main"
                }`}
                onClick={() => setActiveOrdersSelected(true)}
              >
                ACTIVE ORDERS
              </button>
              <button
                className={`px-5 py-2 w-full md:w-auto ${
                  !activeOrdersSelected
                    ? "bg-main1 border border-main"
                    : "bg-black border-r border-t border-b border-grey"
                }`}
                onClick={() => setActiveOrdersSelected(false)}
              >
                ORDER HISTORY
              </button>
            </div>
          </div>
          <div
            className={`overflow-hidden rounded-[4px] mt-3 bg-dark  border border-grey ${
              isLoading && "animate-pulse"
            }`}
          >
            <table className="w-full table-auto rounded-[4px]">
              <thead
                className={`h-10 ${allLimitPositions.length === 0 && "hidden"}`}
              >
                <tr className="text-[11px] text-grey1/90 mb-3 leading-normal">
                  <th className="text-left pl-3 uppercase">Sell</th>
                  <th className="text-left uppercase">Buy</th>
                  <th
                    className={`text-left uppercase ${
                      activeOrdersSelected && "md:table-cell hidden"
                    }`}
                  >
                    Avg. Price
                  </th>
                  <th
                    className={`text-left uppercase ${
                      !activeOrdersSelected && "md:table-cell hidden"
                    }`}
                  >
                    Status
                  </th>
                  <th className="text-left md:table-cell hidden pl-2 uppercase">
                    Age
                  </th>
                </tr>
              </thead>
              {activeOrdersSelected ? (
                isLoading ? (
                  <div className="h-[300px]"></div>
                ) : allLimitPositions.length === 0 ? (
                  <tbody>
                    <tr>
                      <td className="text-grey1 text-xs w-full  py-10 text-center col-span-5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-10 py-4 mx-auto"
                        >
                          <path
                            fillRule="evenodd"
                            d="M1 11.27c0-.246.033-.492.099-.73l1.523-5.521A2.75 2.75 0 015.273 3h9.454a2.75 2.75 0 012.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2 2 0 01-2 2H3a2 2 0 01-2-2v-3.73zm3.068-5.852A1.25 1.25 0 015.273 4.5h9.454a1.25 1.25 0 011.205.918l1.523 5.52c.006.02.01.041.015.062H14a1 1 0 00-.86.49l-.606 1.02a1 1 0 01-.86.49H8.236a1 1 0 01-.894-.553l-.448-.894A1 1 0 006 11H2.53l.015-.062 1.523-5.52z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Your limit orders will appear here.
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody className="divide-y divide-grey/70">
                    {allLimitPositions.map((allLimitPosition, index) => {
                      if (allLimitPosition.id != undefined) {
                        return (
                          <UserLimitPool
                            limitPosition={allLimitPosition}
                            limitFilledAmount={
                              limitFilledAmountList.length > 0
                                ? parseFloat(
                                    ethers.utils.formatUnits(
                                      limitFilledAmountList[index] ?? "0",
                                      allLimitPosition.tokenOut.decimals,
                                    ),
                                  )
                                : parseFloat("0.00")
                            }
                            address={address}
                            href={"/limit/view"}
                            key={allLimitPosition.id}
                          />
                        );
                      }
                    })}
                  </tbody>
                )
              ) : allHistoricalOrders.length == 0 ? (
                <tbody>
                  <tr>
                    <td className="text-grey1 text-xs w-full  py-10 text-center col-span-5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-10 py-4 mx-auto"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1 11.27c0-.246.033-.492.099-.73l1.523-5.521A2.75 2.75 0 015.273 3h9.454a2.75 2.75 0 012.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2 2 0 01-2 2H3a2 2 0 01-2-2v-3.73zm3.068-5.852A1.25 1.25 0 015.273 4.5h9.454a1.25 1.25 0 011.205.918l1.523 5.52c.006.02.01.041.015.062H14a1 1 0 00-.86.49l-.606 1.02a1 1 0 01-.86.49H8.236a1 1 0 01-.894-.553l-.448-.894A1 1 0 006 11H2.53l.015-.062 1.523-5.52z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Your order history will appear here.
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-grey/70">
                  {allHistoricalOrders.map((allHistoricalOrder, index) => {
                    if (allHistoricalOrder.amountIn != undefined) {
                      return (
                        <tr
                          className="text-right text-xs md:text-sm bg-black hover:bg-dark cursor-pointer"
                          key={allHistoricalOrder.id}
                        >
                          <td className="py-3 pl-3">
                            <div className="flex items-center text-xs text-grey1 gap-x-2 text-left">
                              <img
                                className="w-[23px] h-[23px]"
                                src={logoMap[allHistoricalOrder.tokenIn.id]}
                              />
                              {parseFloat(allHistoricalOrder.amountIn).toFixed(
                                3,
                              ) +
                                " " +
                                allHistoricalOrder.tokenIn.symbol}
                            </div>
                          </td>
                          <td className="">
                            <div className="flex items-center text-xs text-white gap-x-2 text-left">
                              <img
                                className="w-[23px] h-[23px]"
                                src={logoMap[allHistoricalOrder.tokenOut.id]}
                              />
                              {parseFloat(allHistoricalOrder.amountOut).toFixed(
                                3,
                              ) +
                                " " +
                                allHistoricalOrder.tokenOut.symbol}
                            </div>
                          </td>
                          <td className="text-left text-xs">
                            <div className="flex flex-col">
                              <span>
                                <span className="text-grey1">
                                  1 {allHistoricalOrder.tokenIn.symbol} ={" "}
                                </span>
                                {parseFloat(
                                  allHistoricalOrder.averagePrice,
                                ).toPrecision(5) +
                                  " " +
                                  allHistoricalOrder.tokenOut.symbol}
                              </span>
                            </div>
                          </td>
                          <td className="md:table-cell hidden">
                            <div className="text-white bg-black border border-grey relative flex items-center justify-center h-7 rounded-[4px] text-center text-[10px]">
                              <span className="z-50 px-3">100% Filled</span>
                              <div className="h-full bg-grey/60 w-full absolute left-0" />
                            </div>
                          </td>
                          <td className="text-grey1 text-left pl-3 text-xs md:table-cell hidden">
                            {timeDifference(
                              allHistoricalOrder.completedAtTimestamp,
                            )}{" "}
                            ago
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              )}
            </table>
          </div>
        </div>
      )}
      <Transition appear show={isSettingsOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsSettingsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-[4px] bg-black text-white border border-grey text-left align-middle shadow-xl px-5 py-5 transition-all">
                  <div className="flex items-center justify-between px-2 mb-5 w-full">
                    <h1 className="text-lg">Change Slippage</h1>
                    <XMarkIcon
                      onClick={() => setIsSettingsOpen(false)}
                      className="w-7 cursor-pointer"
                    />
                  </div>
                  <div className="flex md:flex-row flex-col items-center gap-3">
                    <div className="relative w-full">
                      <input
                        value={tradeSlippage}
                        onChange={(e) =>
                          setTradeSlippage(inputFilter(e.target.value))
                        }
                        className="bg-dark md:w-auto w-full border-grey border h-10 outline-none px-2 text-sm"
                        placeholder="0.1"
                      />
                      <span className="absolute mt-2 -ml-8">%</span>
                    </div>
                    <div className="flex flex-row items-center gap-x-3 w-full">
                      <div
                        onClick={() => {
                          setTradeSlippage("0.1");
                          setIsSettingsOpen(false);
                        }}
                        className="text-sm bg-dark border-grey/50 border h-10 flex items-center justify-center w-full cursor-pointer"
                      >
                        0.1%
                      </div>
                      <div
                        onClick={() => {
                          setTradeSlippage("0.5");
                          setIsSettingsOpen(false);
                        }}
                        className="text-sm bg-dark border-grey/50 border h-10 flex items-center justify-center w-full cursor-pointer"
                      >
                        0.5%
                      </div>
                      <div
                        onClick={() => {
                          setTradeSlippage("1");
                          setIsSettingsOpen(false);
                        }}
                        className="text-sm bg-dark border-grey/50 border h-10 flex items-center justify-center w-full cursor-pointer"
                      >
                        1%
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="w-full mt-8 py-2 disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
                  >
                    {"Confirm"}
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
