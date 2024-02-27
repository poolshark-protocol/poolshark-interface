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
import { vFinABI } from "../../abis/evm/vFin";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import BuyFinSaleButton from "../../components/Buttons/BuyFinSaleButton";

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

  const [chainId, networkName, logoMap, limitSubgraph, setLimitSubgraph] =
    useConfigStore((state) => [
      state.chainId,
      state.networkName,
      state.logoMap,
      state.limitSubgraph,
      state.setLimitSubgraph,
    ]);

  const [tokenAllowance, setTokenAllowance] = useState(undefined);

  const vestStartTime = 1702314000; // Dec 11th, 2023 @ 5pm UTC
  const vestEndTime = 1707498000; // Feb 9th, 2024 @ 5pm UTC

  const [allUserBonds, setAllUserBonds] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [marketPurchase, setMarketPurchase] = useState(undefined);
  const [currentCapacity, setCurrentCapacity] = useState(undefined);
  const [marketPrice, setMarketPrice] = useState(undefined);
  const [ethPrice, setEthPrice] = useState(undefined);
  const [quoteTokensPerPayoutToken, setQuoteTokensPerPayoutToken] =
    useState(undefined);
  const [maxAmountAccepted, setMaxAmountAccepted] = useState(undefined);
  const [bondTokenBalance, setBondTokenBalance] = useState(undefined);
  const bondTokenId = BigNumber.from(
    "50041069287616932026042816520963973508955622977186811114648766172172485699723"
  );
  const [bondProtocolConfig, setBondProtocolConfig] = useState({});

  useEffect(() => {
    setBondProtocolConfig(
      chainProperties[networkName]?.bondProtocol ??
        chainProperties["arbitrum-one"]?.bondProtocol
    );
  }, [networkName]);

  const [tellerDisplay, setPoolDisplay] = useState(
    bondProtocolConfig && bondProtocolConfig["tellerAddress"]
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
  // const vestPercent = (
  //                       (Math.floor((new Date()).getTime() / 1000) - vestStartTime) // current - start
  //                       / (vestEndTime - vestStartTime) * 100                       // divided by
  //                     ).toFixed(2)                                                  // end - start
  const vestPercent = "100.00";

  console.log(
    "bond balance",
    bondTokenBalance?.toString(),
    vestingPositionId == undefined,
    bondTokenBalance?.gt(BN_ZERO)
  );

  const { data: vestedPosition } = useContractRead({
    address: bondProtocolConfig["vFinAddress"],
    abi: vFinABI,
    functionName: "vestPositions",
    args: [vestingPositionId],
    chainId: chainId,
    watch: true,
    enabled:
      bondProtocolConfig["vFinAddress"] != undefined &&
      vestingPositionId != undefined &&
      chainId == 42161,
    onSuccess() {},
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
    enabled:
      bondProtocolConfig["vFinAddress"] != undefined &&
      vestingPositionId != undefined &&
      chainId == 42161,
    onSuccess() {
      console.log("current claim:", viewClaimData?.toString());
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
      setVestedClaimAmount(
        parseFloat(formatUnits(viewClaimData?.toString(), 18))
      );
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
        const data = await fetchUserVFinPositions(limitSubgraph, address);
        const chainConstants = chainProperties[networkName]
          ? chainProperties[networkName]
          : chainProperties["arbitrum"];
        setLimitSubgraph(chainConstants["limitSubgraphUrl"]);
        if (data["data"] && data["data"]["vfinPositions"]?.length == 1) {
          setVestingPositionId(data["data"]["vfinPositions"][0].positionId);
        }
        setNeedsVestingPosition(false);
      }
    } catch (error) {
      console.log(
        "vesting position subgraph error",
        limitSubgraph,
        address,
        error
      );
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
    enabled: needsMarketPurchaseData && chainId == 42161,
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
    enabled: needsCapacityData && chainId == 42161,
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
    enabled: needsMarketPriceData && chainId == 42161,
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
    enabled: needsMarketPriceData && chainId == 42161,
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
    enabled: needsMaxAmountAcceptedData && chainId == 42161,
    onError() {
      console.log("maxAmountAccepted error");
    },
  });

  const { data: bondTokenBalanceData } = useContractRead({
    address: bondProtocolConfig["tellerAddress"],
    abi: bondTellerABI,
    functionName: "balanceOf",
    args: [address, bondTokenId],
    chainId: chainId,
    watch: true,
    enabled:
      bondTokenId != undefined && address != undefined && chainId == 42161,
    onError() {
      console.log("balanceOf error", address, bondTokenId);
    },
  });

  useEffect(() => {
    if (bondTokenBalanceData) {
      setBondTokenBalance(bondTokenBalanceData);
      setNeedsBondTokenData(false);
    }
  }, [bondTokenBalanceData]);

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
    const ethUsdPrice = price["data"]["basePrices"]["0"]["USD"];

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

  const price = 3.12; // Example dynamic value
  const minPrice = 2;
  const maxPrice = 4;
  const totalBars = 20;

  // Calculate the number of fully filled bars
  const filledBars = Math.floor(
    ((price - minPrice) / (maxPrice - minPrice)) * totalBars
  );

  // Calculate the height of the partially filled bar
  const partialFillPercentage =
    (((price - minPrice) / (maxPrice - minPrice)) * totalBars - filledBars) *
    100;

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
                  SALE
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
        {bondTokenBalance != undefined &&
        bondTokenId != undefined &&
        parseFloat(formatEther(bondTokenBalance)) > 0 ? (
          <div className="border bg-main1/30 border-main/40 p-5 mt-5">
            <h1 className="">PAYOUT AVAILABLE</h1>
            <div className="flex flex-col gap-y-4 border-main/60 border rounded-[4px] text-xs p-5 mt-4 bg-black/50 mb-2">
              <div className="flex flex-col gap-y-1 justify-between w-full items-center text-white/20">
                AMOUNT{" "}
                <span className="text-white text-lg">
                  {parseFloat(formatEther(bondTokenBalance)).toFixed(2)} FIN
                </span>
              </div>
            </div>
            <RedeemMulticallBondButton
              tellerAddress={bondProtocolConfig["tellerAddress"]}
              tokenId={bondTokenId}
              amount={bondTokenBalance}
              setNeedsBondTokenData={setNeedsBondTokenData}
            />
          </div>
        ) : null}
        <div className="flex lg:flex-row flex-col justify-between w-full mt-8 gap-10">
          <div className="border h-min border-grey rounded-[4px] lg:w-1/2 w-full p-5 pb-7">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">STATISTICS</h1>
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="flex items-center gap-x-5 mt-3">
                <div className="border border-main rounded-[4px] flex flex-col w-full items-center justify-center gap-y-4 h-32 bg-main1 ">
                  <span className="text-main2/60 text-[13px]">
                    CURRENT BOND PRICE
                  </span>
                  <span className="text-main2 lg:text-4xl text-3xl">${price}</span>
                </div>
              </div>
              <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-4 h-32">
                <span className="text-grey1 text-[13px]">TOTAL VALUE SOLD</span>
                <span className="text-white text-center xl:text-4xl md:text-3xl text-2xl">
                  $353,452.53 {" "}
                  <span className="text-grey1">
                    / $353,452.53
                    </span>
                </span>
              </div>
            </div>
            <div className="flex justify-between mt-5">
              <h1 className="uppercase text-white">PROGRESS</h1>
            </div>
            <div className="flex flex-col">
            <div className="flex items-end h-[150px] mt-4 justify-between">
              {[...Array(20)].map((_, index) => (
                <div
                  key={index}
                  className="relative w-6 h-full bg-main/70 rounded-b-[1px] overflow-hidden rounded-t-md"
                >
                  {index < filledBars ? (
                    // Fully filled bars
                    <div>
                    
                    <div className="w-full bg-main2 h-full rounded-b-[1px] absolute bottom-0" />
                    </div>
                  ) : index === filledBars ? (
                    // Partially filled bar
                    <div
                      style={{ height: `${partialFillPercentage}%` }}
                      className="w-full bg-main2 rounded-b-[1px] absolute bottom-0"
                    />
                  ) : null}
                </div>
              ))}
            </div>
            <div className="flex justify-between w-full mt-2">
              <span>$2</span>
              <span>$4</span>
            </div>
            </div>
          </div>
          <div className="flex gap-y-5 flex-col w-full lg:w-1/2 relative">
            <div className="border relative bg-dark border-grey rounded-[4px] w-full p-5 pb-7 h-full">
              <div className="">
                <h1 className="uppercase text-white">BUY FIN LIMIT SALE</h1>
              </div>
              <div className="relative">
                {/*
                <div className="flex flex-col gap-y-7">
                <div className="border border-grey bg-black rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                  <div className="flex items-end justify-between text-[11px] text-grey1">
                    <span>
                      ~$
                      {ethPrice != undefined && display != ""
                        ? (parseFloat(display) * ethPrice).toFixed(2)
                        : "0.00"}
                    </span>
                    <span>
                      BALANCE:{" "}
                      {tokenBalance != undefined
                        ? formatEther(tokenBalance.value)
                        : "0"}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                    {inputBox("0", {
                      callId: 0,
                      name: marketData[0]?.quoteTokenName,
                      symbol: marketData[0]?.quoteTokenSymbol,
                      logoURI: "",
                      address: marketData[0]?.quoteTokenAddress,
                      decimals: marketData[0]?.quoteTokenDecimals,
                      userBalance: tokenBalance,
                      userRouterAllowance: BigNumber.from(0),
                      USDPrice: 0,
                    } as tokenSwap)}
                    <div className="flex items-center gap-x-2 ">
                      <button
                        className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border md:block hidden"
                        onClick={() => {
                          maxBalance(
                            tokenBalance != undefined
                              ? formatEther(tokenBalance.value)
                              : "0",
                            "0",
                            marketData != undefined
                              ? marketData[0].quoteTokenDecimals
                              : 18
                          );
                        }}
                      >
                        MAX
                      </button>
                      <div className="flex items-center gap-x-2">
                        <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px] min-w-[120px]">
                          <img
                            height="28"
                            width="25"
                            src="/static/images/weth_icon.png"
                          />
                          WETH
                        </div>
                      </div>
                    </div>
                */}
                <div className="flex flex-col bg-black gap-y-4 border-grey/70 border rounded-[4px] text-xs pt-5 pb-3 px-2 mt-5">
                  <div className="flex justify-between w-full text-grey1 px-3">
                    WETH AMOUNT
                    <span className="text-grey1">
                      1 WETH
                    </span>
                  </div>
                  <div className="flex justify-between w-full text-grey1 px-3">
                    FIN PRICE
                    <span className="text-grey1">
                    ${price}
                    </span>
                  </div>
                  <div className="w-full bg-grey h-[1px]" />
                  <div className="flex justify-between w-full text-main2 bg-main1 py-3 border border-main/30 px-3 rounded-[4px]">
                    BUY AMOUNT{" "}
                    <span className="text-main2">
                      5 FIN
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <BuyFinSaleButton/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
