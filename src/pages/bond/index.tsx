import Navbar from "../../components/Navbar";
import ExternalLinkIcon from "../../components/Icons/ExternalLinkIcon";
import RedeemMulticallBondButton from "../../components/Buttons/RedeemMulticallBondButton";
import { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { bondTellerABI } from "../../abis/evm/bondTeller";
import {
  fetchBondMarket,
  fetchEthPrice,
  fetchUserBonds,
  fetchUserVFinPositions,
} from "../../utils/queries";
import { mapBondMarkets, mapUserBondPurchases } from "../../utils/maps";
import { convertTimestampToDateFormat } from "../../utils/time";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils.js";
import { methABI } from "../../abis/evm/meth";
import { auctioneerABI } from "../../abis/evm/bondAuctioneer";
import useInputBox from "../../hooks/useInputBox";
import { chainProperties, supportedNetworkNames } from "../../utils/chains";
import ClaimFinButton from "../../components/Buttons/ClaimFinButton";
import VestFinButton from "../../components/Buttons/VestFinButton";
import { vFinABI } from "../../abis/evm/vFin";
import { BN_ZERO } from "../../utils/math/constants";

export default function Bond() {
  const { address, isConnected } = useAccount();

  const [needsSubgraph, setNeedsSubgraph] = useState(true);
  const [isVested, setIsVested] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [needsBalance, setNeedsBalance] = useState(true);
  const [needsAllowance, setNeedsAllowance] = useState(true);
  const [needsMarketPurchaseData, setNeedsMarketPurchaseData] = useState(true);
  const [needsCapacityData, setNeedsCapacityData] = useState(true);
  const [needsMarketPriceData, setNeedsMarketPriceData] = useState(true);
  const [needsMaxAmountAcceptedData, setNeedsMaxAmountAcceptedData] =
    useState(true);
  const [needsBondTokenData, setNeedsBondTokenData] = useState(true);

  const [chainId, networkName, logoMap, limitSubgraph, setLimitSubgraph] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
    state.logoMap,
    state.limitSubgraph,
    state.setLimitSubgraph,
  ]);

  const [tokenAllowance, setTokenAllowance] = useState(undefined);

  const vestStartTime = 1702314000  // Dec 11th, 2023 @ 5pm UTC
  const vestEndTime   = 1707498000  // Feb 9th, 2024 @ 5pm UTC

  const [allUserBonds, setAllUserBonds] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [marketPurchase, setMarketPurchase] = useState(undefined);
  const [currentCapacity, setCurrentCapacity] = useState(undefined);
  const [marketPrice, setMarketPrice] = useState(undefined);
  const [ethPrice, setEthPrice] = useState(undefined);
  const [quoteTokensPerPayoutToken, setQuoteTokensPerPayoutToken] =
    useState(undefined);
  const [maxAmountAccepted, setMaxAmountAccepted] = useState(undefined);
  const [vestingTokenBalance, setVestingTokenBalance] = useState(undefined);
  const [vestingTokenId, setVestingTokenId] = useState(undefined);
  const [bondProtocolConfig, setBondProtocolConfig] = useState({});

  useEffect(() => {
    console.log('network name', networkName)
    setBondProtocolConfig(
      chainProperties[networkName]["bondProtocol"] ??
        chainProperties["arbitrum"]["bondProtocol"]
    );
  }, [networkName]);

  const [tellerDisplay, setPoolDisplay] = useState(
    bondProtocolConfig["tellerAddress"]
      ? bondProtocolConfig["tellerAddress"].toString().substring(0, 6) +
          "..." +
          bondProtocolConfig["tellerAddress"]
            .toString()
            .substring(
              bondProtocolConfig["tellerAddress"].toString().length - 4,
              bondProtocolConfig["tellerAddress"].toString().length
            )
      : undefined
  );

  const [activeOrdersSelected, setActiveOrdersSelected] = useState(true);

  // VESTING
  const [vestingPositionId, setVestingPositionId] = useState(undefined);
  const [needsVestingPosition, setNeedsVestingPosition] = useState(true);
  const [vestedAmount, setVestedAmount] = useState(0);
  const [vestedClaimAmount, setVestedClaimAmount] = useState(0);
  const vestPercent = (
                        (Math.floor((new Date()).getTime() / 1000) - vestStartTime) // current - start
                        / (vestEndTime - vestStartTime) * 100                       // divided by
                      ).toFixed(2)                                                  // end - start

  const { data: vestedPosition } = useContractRead({
    address: bondProtocolConfig["vFinAddress"],
    abi: vFinABI,
    functionName: "vestPositions",
    args: [vestingPositionId],
    chainId: chainId,
    watch: true,
    enabled: bondProtocolConfig["vFinAddress"] != undefined
              && vestingPositionId != undefined,
    onSuccess() {
    },
    onError() {
      console.log("vestPositions error");
    },
  });

  const { data: viewClaimData } = useContractRead({
    address: bondProtocolConfig["vFinAddress"],
    abi: vFinABI,
    functionName: "viewClaim",
    args: [vestingPositionId],
    chainId: chainId,
    watch: true,
    enabled: bondProtocolConfig["vFinAddress"] != undefined
              && vestingPositionId != undefined,
    onSuccess() {
    },
    onError() {
      console.log("vestPositions error");
    },
  });

  useEffect(() => {
    if (vestedPosition != undefined) {
      if (vestedPosition[0]?.gt(BN_ZERO)) {
        setVestedAmount(parseFloat(formatUnits(vestedPosition[0] ?? 0, 18)));
      }
    }
  }, [vestedPosition]);

  useEffect(() => {

    if (viewClaimData != undefined) {
      setVestedClaimAmount(parseFloat(formatUnits(viewClaimData?.toString(), 18)))
    }
    // if (vestedPosition != undefined) {
    //   if (vestedPosition[0]?.gt(BN_ZERO)) {
    //     setVestedClaimAmount(parseFloat(formatUnits(viewClaimData[0] ?? 0, 18)));
    //   }
    // }
  }, [viewClaimData]);

  async function getUserVesting() {
    try {
      if (isConnected && vestingPositionId == undefined) {
        const data = await fetchUserVFinPositions(
          limitSubgraph,
          address,
        );
        const chainConstants = chainProperties[networkName] ? chainProperties[networkName]
                                                            : chainProperties['arbitrumGoerli']; //TODO: arbitrumOne values
        setLimitSubgraph(chainConstants['limitSubgraphUrl'])
        if (data["data"] && data["data"]["vfinPositions"]?.length == 1) {
          setVestingPositionId(data["data"]["vfinPositions"][0].positionId);
        }
        setNeedsVestingPosition(false)
      }
    } catch (error) {
      console.log("vesting position subgraph error", limitSubgraph, address, error);
    }
  }

  async function getUserBonds() {
    try {
      if (isConnected && bondProtocolConfig["marketId"] != undefined) {
        const data = await fetchUserBonds(
          bondProtocolConfig["marketId"].toString(),
          address.toLowerCase(),
          bondProtocolConfig["subgraphUrl"]
        );
        if (data["data"]) {
          setAllUserBonds(mapUserBondPurchases(data["data"].bondPurchases));
        }
      }
    } catch (error) {
      console.log("user bond subgraph error", error);
    }
  }

  async function getMarket() {
    try {
      if (bondProtocolConfig["marketId"] != undefined) {
        const data = await fetchBondMarket(
          bondProtocolConfig["marketId"].toString(),
          bondProtocolConfig["subgraphUrl"]
        );
        if (data["data"]) {
          setMarketData(mapBondMarkets(data["data"].markets));
        }
      }
    } catch (error) {
      console.log("market subgraph error", error);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    getMarket();
    getUserBonds();
    setNeedsSubgraph(false);
  }, [bondProtocolConfig]);

  useEffect(() => {
    if (vestingPositionId == undefined) {
      getUserVesting();
    }
  }, [needsVestingPosition]);

  useEffect(() => {
    if (needsSubgraph) {
      getMarket();
      getUserBonds();
      getEthUsdPrice();
      setNeedsSubgraph(false);
    }
  }, [needsSubgraph]);

  const { data: marketPurchaseData } = useContractRead({
    address: bondProtocolConfig["auctioneerAddress"],
    abi: auctioneerABI,
    functionName: "getMarketInfoForPurchase",
    args: [bondProtocolConfig["marketId"]],
    chainId: chainId,
    watch: needsMarketPurchaseData,
    enabled: needsMarketPurchaseData,
    onError() {
      console.log("getMarketInfoForPurchase error");
    },
  });

  useEffect(() => {
    if (marketPurchaseData) {
      setMarketPurchase(marketPurchaseData);
      setNeedsMarketPurchaseData(false);
    }
  }, [marketPurchaseData]);

  const { data: currentCapacityData } = useContractRead({
    address: bondProtocolConfig["auctioneerAddress"],
    abi: auctioneerABI,
    functionName: "currentCapacity",
    args: [bondProtocolConfig["marketId"]],
    chainId: chainId,
    watch: needsCapacityData,
    enabled: needsCapacityData,
    onError() {
      console.log("current capacity error");
    },
  });

  useEffect(() => {
    if (currentCapacityData) {
      setCurrentCapacity(currentCapacityData);
      setNeedsCapacityData(false);
    }
  }, [currentCapacityData]);

  const { data: marketPriceData } = useContractRead({
    address: bondProtocolConfig["auctioneerAddress"],
    abi: auctioneerABI,
    functionName: "marketPrice",
    args: [bondProtocolConfig["marketId"]],
    chainId: chainId,
    watch: needsMarketPriceData,
    enabled: needsMarketPriceData,
    onError() {
      console.log("marketPrice error");
    },
  });

  const { data: marketScaleData } = useContractRead({
    address: bondProtocolConfig["auctioneerAddress"],
    abi: auctioneerABI,
    functionName: "marketScale",
    args: [bondProtocolConfig["marketId"]],
    chainId: chainId,
    watch: needsMarketPriceData,
    enabled: needsMarketPriceData,
    onError() {
      console.log("marketScale error");
    },
  });

  const { data: maxAmountAcceptedData } = useContractRead({
    address: bondProtocolConfig["auctioneerAddress"],
    abi: auctioneerABI,
    functionName: "maxAmountAccepted",
    args: [bondProtocolConfig["marketId"], bondProtocolConfig["nullReferrer"]],
    chainId: chainId,
    watch: needsMaxAmountAcceptedData,
    enabled: needsMaxAmountAcceptedData,
    onError() {
      console.log("maxAmountAccepted error");
    },
  });

  const { data: vestingTokenIdData } = useContractRead({
    address: bondProtocolConfig["tellerAddress"],
    abi: bondTellerABI,
    functionName: "getTokenId",
    args: [bondProtocolConfig["finAddress"], marketData[0]?.vesting], // add vesting period to each date market is open
    chainId: chainId,
    enabled:
      bondProtocolConfig["tellerAddress"] != undefined &&
      marketData[0] != undefined,
    onError() {
      console.log(
        "getTokenId error",
        bondProtocolConfig["tellerAddress"],
        bondProtocolConfig["finAddress"],
        marketData[0]?.vesting
      );
    },
  });

  useEffect(() => {
    if (vestingTokenIdData) {
      setVestingTokenId(vestingTokenIdData);
    }
  }, [vestingTokenIdData]);

  const { data: vestingTokenBalanceData } = useContractRead({
    address: bondProtocolConfig["tellerAddress"],
    abi: bondTellerABI,
    functionName: "balanceOf",
    args: [address, vestingTokenId],
    chainId: chainId,
    watch: needsBondTokenData,
    enabled: needsBondTokenData 
              && vestingTokenId != undefined
              && address != undefined,
    onError() {
      console.log("balanceOf error", address, vestingTokenId);
    },
  });

  useEffect(() => {
    if (vestingTokenBalanceData) {
      setVestingTokenBalance(vestingTokenBalanceData);
      setNeedsBondTokenData(false);
    }
  }, [vestingTokenBalanceData]);

  useEffect(() => {
    if (maxAmountAcceptedData) {
      const maxAccepted = Number(maxAmountAcceptedData) / Math.pow(10, 18);
      setMaxAmountAccepted(maxAccepted);
      setNeedsMaxAmountAcceptedData(false);
    }
  }, [maxAmountAcceptedData]);

  useEffect(() => {
    if (marketPriceData && marketScaleData && ethPrice) {
      const baseScale = BigNumber.from("10").pow(
        BigNumber.from("36").add(18).sub(18)
      );
      const shift = Number(baseScale) / Number(marketScaleData);
      const price = Number(marketPriceData) * shift;
      const quoteTokensPerPayoutToken = price / Math.pow(10, 36);
      const discountedPrice = quoteTokensPerPayoutToken * ethPrice;

      setQuoteTokensPerPayoutToken(quoteTokensPerPayoutToken);
      setMarketPrice(discountedPrice);
      setNeedsMarketPriceData(false);
    }
  }, [marketPriceData, marketScaleData, ethPrice]);

  const getEthUsdPrice = async () => {
    const price = await fetchEthPrice();
    const ethUsdPrice = price["data"]["bundles"]["0"]["ethPriceUSD"];

    setEthPrice(ethUsdPrice);
  };

  const filledAmount =
    currentCapacity != undefined && marketData[0] != undefined
      ? (
          (1 -
            parseFloat(formatEther(currentCapacity)) /
              parseFloat(formatEther(marketData[0].capacity))) *
          100
        ).toFixed(2)
      : "0";

  const filledPercentage = parseFloat(filledAmount).toFixed(2) + "%";

  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className="flex flex-col pt-10 pb-32 md:pb-0 text-white relative min-h-[calc(100vh-76px)] container mx-auto md:px-0 px-3">
        <div className="flex md:flex-row flex-col justify-between w-full items-start md:items-center gap-y-5">
          <div className="flex items-center gap-x-4">
            <div className="">
              <img height="70" width="70" src="/static/images/fin_icon.png" />
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="flex text-lg items-center text-white">
                <h1>
                  $
                  {marketData[0] != undefined
                    ? marketData[0]?.payoutTokenSymbol
                    : "FIN"}{" "}
                  BOND
                </h1>
                <a
                  href={
                    `${chainProperties[networkName]["explorerUrl"]}/address/` +
                    bondProtocolConfig["tellerAddress"]
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-x-3 text-grey1 group cursor-pointer"
                >
                  <span className="-mb-1 text-light text-xs ml-8 group-hover:underline">
                    {tellerDisplay}
                  </span>{" "}
                  <ExternalLinkIcon />
                </a>
              </div>
              <div className="flex text-xs text-[#999999] items-center gap-x-3">
                STATUS:{" "}
                <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                  100% FILLED
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-x-4 w-full md:w-auto">
            <a
              className="bg-black border whitespace-nowrap w-full text-center border-grey transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px] text-grey1"
              href={
                "https://docs.bondprotocol.finance/products/permissionless-bonds"
              }
              target="_blank"
              rel="noreferrer"
            >
              How does it work?
            </a>
          </div>
        </div>
        {/* add vesting claim for each day the market is live */}
        {vestingTokenBalance != undefined &&
        vestingTokenId != undefined &&
        parseFloat(formatEther(vestingTokenBalance)) > 0 ? (
          <div className="border bg-main1/30 border-main/40 p-5 mt-5">
            <h1 className="">PAYOUT AVAILABLE</h1>
            <div className="flex flex-col gap-y-4 border-main/60 border rounded-[4px] text-xs p-5 mt-4 bg-black/50 mb-2">
              <div className="flex flex-col gap-y-1 justify-between w-full items-center text-white/20">
                AMOUNT{" "}
                <span className="text-white text-lg">
                  {parseFloat(formatEther(vestingTokenBalance)).toFixed(4)} FIN
                </span>
              </div>
            </div>
            <RedeemMulticallBondButton
              tellerAddress={bondProtocolConfig["tellerAddress"]}
              tokenId={vestingTokenId}
              amount={vestingTokenBalance}
              setNeedsBondTokenData={setNeedsBondTokenData}
            />
          </div>
        ) : null}
        <div className="flex lg:flex-row flex-col justify-between w-full mt-8 gap-10">
          <div className="border h-min border-grey rounded-[4px] lg:w-1/2 w-full p-5 pb-7">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">STATISTICS</h1>
              <span className="text-grey1">100% FILLED</span>
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="flex items-center gap-x-5 mt-3">
                <div className="border border-main rounded-[4px] flex flex-col w-full items-center justify-center gap-y-4 h-32 bg-main1 ">
                  <span className="text-main2/60 text-[13px]">
                    CURRENT BOND PRICE
                  </span>
                  <span className="text-main2 lg:text-4xl text-3xl">
                    $
                    {ethPrice != undefined && marketPrice != undefined
                      ? marketPrice.toFixed(4)
                      : "0"}
                  </span>
                </div>
                {/*<div className=" rounded-[4px] flex flex-col w-full bg-[#2ECC71]/10 items-center justify-center gap-y-4 h-32">
                  <span className="text-[#2ECC71]/50 text-[13px]">
                    CURRENT DISCOUNT
                  </span>
                  <span className="text-[#2ECC71] text-2xl md:text-4xl">
                    1.53%
                  </span>
                </div>*/}
              </div>
              <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-4 h-32">
                <span className="text-grey1 text-[13px]">
                  TOTAL BONDED VALUE
                </span>
                <span className="text-white text-center xl:text-4xl md:text-3xl text-2xl">
                  $
                  {marketData[0] != undefined && ethPrice != undefined
                    ? (marketData[0].totalBondedAmount * ethPrice).toFixed(2)
                    : "0"}{" "}
                  <span className="text-grey1">
                    / $
                    {ethPrice != undefined &&
                    marketData[0] != undefined &&
                    marketPrice != undefined
                      ? (
                          marketPrice *
                          parseFloat(formatEther(marketData[0].capacity))
                        ).toFixed(2)
                      : "0"}
                  </span>
                </span>
              </div>
            </div>
            {/*
            <div className="flex flex-col gap-y-3 mt-5">
              <div className="flex justify-between ">
                <h1 className="uppercase text-white">REMAINING CAPACITY</h1>
                <span>
                  {currentCapacity != undefined
                    ? parseFloat(formatEther(currentCapacity)).toFixed(2)
                    : "0"}{" "}
                  <span className="text-grey1">FIN</span>
                </span>
              </div>
              {isLoading ? (<div className="bg-grey/60 animate-pulse relative h-10 rounded-full w-full overflow-hidden">
                
              </div>) : ( <div className="bg-main1/70 relative h-10 rounded-full w-full overflow-hidden border border-main">
                <div
                  className={`text-sm text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50`}
                >
                  {filledAmount}% FILLED
                </div>
                <div
                style={{width: filledPercentage}}
                  className={`absolute relative flex items-center justify-center h-[38px] bg-main1 rounded-full `}
                />
              </div>)}
             
            </div>
            */}
          </div>
          <div className="flex gap-y-5 flex-col w-full lg:w-1/2 relative">
          {vestingPositionId == undefined &&
          <div className="bg-black/60 backdrop-blur-[4px] w-full h-full absolute z-50 px-5 flex items-center justify-center ">
            <div className="flex w-full flex-col gap-y-8 items-start justify-center bg-dark border border-grey rounded-[4px] p-5">
              <div className="">
                <h1 className="uppercase text-white">VEST BOND</h1>
                <p className="text-sm text-grey3 font-light mt-1">
                Exchange your FIN bonds for an equal 60-day vest ending 02/09/2024.
                </p>
              </div>
                <VestFinButton
                  vFinAddress={bondProtocolConfig['vFinAddress']}
                  tellerAddress={bondProtocolConfig['mockTellerAddress']}
                  bondTokenId={bondProtocolConfig['bondTokenId']}
                  needsVestingPosition={needsVestingPosition}
                  setNeedsVestingPosition={setNeedsVestingPosition}
                />
            </div>
          </div>}
            <div className="border relative bg-dark border-grey rounded-[4px] w-full p-5 pb-7 h-full">
              <div className="">
                <h1 className="uppercase text-white">CLAIM BOND</h1>
                <p className="text-sm text-grey3 font-light mt-1">
                  Vesting ends 02/09/2024. Users can claim vested FIN at any time.
                </p>
              </div>
              <div className="relative">
                <div className="bg-black relative h-10 rounded-full w-full overflow-hidden border border-grey/70 mt-5">
                  <div
                    className={`text-sm text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40`}
                  >
                    {vestPercent}% VESTED <span className="opacity-50">({parseFloat(vestPercent) * vestedAmount / 100} FIN)</span>
                  </div>
                  <div
                    style={{ width: vestPercent + "%" }}
                    className={`absolute relative flex items-center justify-center h-[38px] bg-grey/50 rounded-full `}
                  />
                </div>
                <div className="flex flex-col bg-black gap-y-4 border-grey/70 border rounded-[4px] text-xs pt-5 pb-3 px-2 mt-5">
                  <div className="flex justify-between w-full text-grey1 px-3">
                    VESTED
                    <span className="text-grey1">{parseFloat(vestPercent) * vestedAmount / 100} FIN</span>
                  </div>
                  <div className="flex justify-between w-full text-grey1 px-3">
                    CLAIMED
                    <span className="text-grey1">{(parseFloat(vestPercent) * vestedAmount / 100 - vestedClaimAmount).toFixed(2)} FIN</span>
                  </div>
                  <div className="w-full bg-grey h-[1px]" />
                  <div className="flex justify-between w-full text-main2 bg-main1 py-3 border border-main/30 px-3 rounded-[4px]">
                    AVAILABLE TO CLAIM <span className="text-main2">{vestedClaimAmount.toFixed(2)} FIN</span>
                  </div>
                </div>
                <div className="mt-6">
                  <ClaimFinButton claimAmount={vestedClaimAmount} vFinAddress={bondProtocolConfig['vFinAddress']} positionId={vestingPositionId} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <div className="md:mb-20 mb-32 w-full">
            <div className="flex md:flex-row flex-col gap-y-3 item-end justify-between w-full">
              <h1 className="mt-1.5">TRANSACTION HISTORY</h1>
              <div className="text-xs w-full md:w-auto flex">
                <button
                  className={`px-5 py-2 w-full md:w-auto ${
                    !activeOrdersSelected
                      ? "bg-black border-l border-t border-b border-grey"
                      : "bg-main1 border border-main"
                  }`}
                  onClick={() => setActiveOrdersSelected(true)}
                >
                  ACTIVE BONDS
                </button>
                <button
                  className={`px-5 py-2 w-full md:w-auto ${
                    !activeOrdersSelected
                      ? "bg-main1 border border-main"
                      : "bg-black border-r border-t border-b border-grey"
                  }`}
                  onClick={() => setActiveOrdersSelected(false)}
                >
                  MATURED BONDS
                </button>
              </div>
            </div>
            {allUserBonds.length === 0 ? (
              <div className="flex items-center justify-center w-full rounded-[4px] mt-3 bg-dark  border border-grey">
                <div className="text-grey1 text-xs  py-10 text-center w-full">
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
                  Your bond purchases will appear here.
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[4px] mt-3 bg-dark  border border-grey">
                {activeOrdersSelected ? (
                  <table className="w-full table-auto rounded-[4px]">
                    <thead>
                      <tr className="text-[11px] text-grey1/90 mb-3 leading-normal">
                        <th className="text-left pl-3 py-3 uppercase">DATE</th>
                        <th className="text-left uppercase">BOND AMOUNT</th>
                        <th className="text-left uppercase">PAYOUT AMOUNT</th>
                        {/*<th className="text-left uppercase">DISCOUNT</th>
                    <th className="text-left uppercase">DAILY UNLOCK</th>*/}
                        <th className="text-left uppercase">UNLOCKS ON</th>
                        <th className="text-left uppercase md:table-cell hidden">
                          TRANSACTION HASH
                        </th>
                        {/*<th className="text-left uppercase">ADDRESS</th>*/}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey/70">
                      {allUserBonds.map((userBond) => {
                        if (userBond.id != undefined) {
                          if (
                            Date.now() / 1000 <
                            userBond.timestamp + marketData[0]?.vesting
                          ) {
                            return (
                              <tr
                                key={userBond.id}
                                className="text-left text-xs py-2 md:text-sm bg-black"
                              >
                                <td className="pl-3 py-2 text-grey1">
                                  {convertTimestampToDateFormat(
                                    userBond.timestamp
                                  )}
                                </td>
                                <td className="">
                                  <div className="flex gap-x-1.5 items-center">
                                    <img
                                      className="w-5 md:block hidden"
                                      src={
                                        logoMap[
                                          bondProtocolConfig["wethAddress"]
                                        ]
                                      }
                                    />
                                    {parseFloat(userBond.amount).toFixed(4)}{" "}
                                    {userBond.quoteTokenSymbol}
                                  </div>
                                </td>
                                <td className="">
                                  <div className="flex gap-x-1.5 items-center">
                                    <img
                                      className="w-5 md:block hidden"
                                      src="/static/images/fin_icon.png"
                                    />
                                    {parseFloat(userBond.payout).toFixed(4)}{" "}
                                    {userBond.payoutTokenSymbol}
                                  </div>
                                </td>
                                {/*<td className="">0.9%</td>
                            <td className="">0.94 FIN</td>*/}
                                <td className="">
                                  {convertTimestampToDateFormat(
                                    Date.now() / 1000 + marketData[0]?.vesting
                                  )}
                                </td>
                                <td className="text-grey1 text-right pr-2 md:pr-0 md:w-40">
                                  {" "}
                                  <div className="flex gap-x-1.5 items-center">
                                    <a
                                      href={
                                        `${chainProperties[networkName]["explorerUrl"]}/tx/` +
                                        userBond.id
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <div className="flex md:justify-start justify-end gap-x-1.5 items-center hover:underline">
                                        <span className="md:block hidden">
                                          {userBond.id
                                            ? userBond.id
                                                .toString()
                                                .substring(0, 6) +
                                              "..." +
                                              userBond.id
                                                .toString()
                                                .substring(
                                                  userBond.id.toString()
                                                    .length - 4,
                                                  userBond.id.toString().length
                                                )
                                            : undefined}
                                        </span>
                                        <ExternalLinkIcon />
                                      </div>
                                    </a>
                                  </div>
                                </td>
                                {/*<td className="text-grey1">
                              <div className="flex gap-x-1.5 items-center">
                                0x123...456 <ExternalLinkIcon />
                              </div>
                            </td>*/}
                                {/*
                              <td className="w-28">
                                <RedeemBondButton 
                          tokenId={vestingTokenId != undefined ? vestingTokenId : BigNumber.from(0)}
                          amount={vestingTokenBalance != undefined ? vestingTokenBalance : BigNumber.from(0)}
                          setNeedsBondTokenData={setNeedsBondTokenData}
                          disabled={marketData != undefined ? ((Date.now() / 1000) < (userBond.timestamp + marketData[0]?.vesting)) : true}
                            />
                              </td>
                              */}
                              </tr>
                            );
                          }
                        }
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full table-auto rounded-[4px]">
                    <thead>
                      <tr className="text-[11px] text-grey1/90 mb-3 leading-normal">
                        <th className="text-left pl-3 py-3 uppercase">DATE</th>
                        <th className="text-left uppercase">BOND AMOUNT</th>
                        <th className="text-left uppercase">PAYOUT AMOUNT</th>
                        {/*<th className="text-left uppercase">DISCOUNT</th>
                          <th className="text-left uppercase">DAILY UNLOCK</th>*/}
                        <th className="text-left uppercase">UNLOCKED ON</th>
                        <th className="text-left uppercase md:table-cell hidden">
                          TRANSACTION HASH
                        </th>
                        {/*<th className="text-left uppercase">ADDRESS</th>*/}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey/70">
                      {allUserBonds.map((userBond) => {
                        if (userBond.id != undefined) {
                          if (
                            Date.now() / 1000 >=
                            userBond.timestamp + marketData[0]?.vesting
                          ) {
                            return (
                              <tr
                                key={userBond.id}
                                className="text-left text-xs py-2 md:text-sm bg-black"
                              >
                                <td className="pl-3 py-2 text-grey1">
                                  {convertTimestampToDateFormat(
                                    userBond.timestamp
                                  )}
                                </td>
                                <td className="">
                                  <div className="flex gap-x-1.5 items-center">
                                    <img
                                      className="w-5 md:block hidden"
                                      src={
                                        logoMap[
                                          bondProtocolConfig["wethAddress"]
                                        ]
                                      }
                                    />
                                    {parseFloat(userBond.amount).toFixed(4)}{" "}
                                    {userBond.quoteTokenSymbol}
                                  </div>
                                </td>
                                <td className="">
                                  <div className="flex gap-x-1.5 items-center">
                                    <img
                                      className="w-5 md:block hidden"
                                      src="/static/images/fin_icon.png"
                                    />
                                    {parseFloat(userBond.payout).toFixed(4)}{" "}
                                    {userBond.payoutTokenSymbol}
                                  </div>
                                </td>
                                {/*<td className="">0.9%</td>
                            <td className="">0.94 FIN</td>*/}
                                <td className="">
                                  {convertTimestampToDateFormat(
                                    Date.now() / 1000 + marketData[0]?.vesting
                                  )}
                                </td>
                                <td className="text-grey1 text-right pr-2 md:pr-0 md:w-40 ">
                                  <a
                                    href={
                                      `${chainProperties[networkName]["explorerUrl"]}/tx/` +
                                      userBond.id
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <div className="flex md:justify-start justify-end gap-x-1.5 items-center hover:underline">
                                      <span className="md:block hidden">
                                        {userBond.id
                                          ? userBond.id
                                              .toString()
                                              .substring(0, 6) +
                                            "..." +
                                            userBond.id
                                              .toString()
                                              .substring(
                                                userBond.id.toString().length -
                                                  4,
                                                userBond.id.toString().length
                                              )
                                          : undefined}
                                      </span>
                                      <ExternalLinkIcon />
                                    </div>
                                  </a>
                                </td>
                                {/*<td className="text-grey1">
                              <div className="flex gap-x-1.5 items-center">
                                0x123...456 <ExternalLinkIcon />
                              </div>
                            </td>*/}
                                {/*
                              <td className="w-28">
                                <RedeemBondButton 
                          tokenId={vestingTokenId != undefined ? vestingTokenId : BigNumber.from(0)}
                          amount={vestingTokenBalance != undefined ? vestingTokenBalance : BigNumber.from(0)}
                          setNeedsBondTokenData={setNeedsBondTokenData}
                          disabled={marketData != undefined ? ((Date.now() / 1000) < (userBond.timestamp + marketData[0]?.vesting)) : true}
                            />
                              </td>*/}
                              </tr>
                            );
                          }
                        }
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
