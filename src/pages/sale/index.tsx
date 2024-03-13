import Navbar from "../../components/Navbar";
import ExternalLinkIcon from "../../components/Icons/ExternalLinkIcon";
import { useEffect, useState } from "react";
import { useConfigStore } from "../../hooks/useConfigStore";
import Link from "next/link";
import { chainIdsToNames, chainProperties, supportedNetworkNames } from "../../utils/chains";
import { fetchTokenPrice } from "../../utils/queries";
import { limitPoolABI } from "../../abis/evm/limitPool";
import { useContractRead, useSwitchNetwork } from "wagmi";
import { parseUnits } from "../../utils/math/valueMath";
import { getExpectedAmountOutFromInput } from "../../utils/math/priceMath";
import { formatUnits } from "ethers/lib/utils.js";
import { TickMath } from "../../utils/math/tickMath";
import { baseToken, token } from "../../utils/types";
import JSBI from "jsbi";
import { useRouter } from 'next/router';
import { saleConfig } from "../_app";
import { redirect } from "next/dist/server/api-utils";
import { useTradeStore } from "../../hooks/useTradeStore";

export default function Sale() {
  const [priceFill, setPriceFill] = useState("100%");
  const [isLoading, setIsLoading] = useState(true);
  const [price, setPrice] = useState("");
  const [ethReceived, setEthReceived] = useState("");
  const [ethTotal, setEthTotal] = useState(formatUnits(getExpectedAmountOutFromInput(saleConfig.limitLP.lower, saleConfig.limitLP.upper, false, parseUnits("1000000", 18)), 18));
  const [ethUsdPrice, setEthUsdPrice] = useState(0);
  const startSqrtPrice = TickMath.getSqrtRatioAtTick(saleConfig.limitLP.upper);
  const endSqrtPrice = TickMath.getSqrtRatioAtTick(saleConfig.limitLP.lower);
  const [startUsdPrice, setStartUsdPrice] = useState("0.00");
  const [endUsdPrice, setEndUsdPrice] = useState("0.00");
  const router = useRouter();
  const wethToken: baseToken = {address: saleConfig.wethAddress as `0x${string}`, decimals: 18}
  const finToken: baseToken = {address: saleConfig.finAddress as `0x${string}`, decimals: 18}


  const [chainId, networkName, logoMap, limitSubgraph, setLimitSubgraph, setNetworkName] =
    useConfigStore((state) => [
      state.chainId,
      state.networkName,
      state.logoMap,
      state.limitSubgraph,
      state.setLimitSubgraph,
      state.setNetworkName,
    ]);


  const [resetTradeLimitParams] =
    useTradeStore((state) => [
      state.resetTradeLimitParams,
    ]);


  const {
    chains,
    error: networkError,
    switchNetwork,
  } = useSwitchNetwork({});

  
  useEffect(() => {
    resetTradeLimitParams(chainId)
    setIsLoading(true)
    setNetworkName(chainIdsToNames[chainId])
  }, [chainId]);

  useEffect(() => {
    if (chainId != saleConfig.chainId && switchNetwork) {
      
      switchNetwork(saleConfig.chainId)
    }
  }, [chainId, switchNetwork, networkName]);

  useEffect(() => {
    if (networkName != chainIdsToNames[saleConfig.chainId]) {
      return
    }
    const fetchFinUsdPrice = async () => {
      const data = await fetchTokenPrice(limitSubgraph, saleConfig.finAddress)
      if (data["data"] && chainId == saleConfig.chainId) {
        const priceString = data["data"]["tokens"][0]?.usdPrice
        const newPrice = parseFloat(priceString).toFixed(2) 
        setPrice("$" + newPrice) 
      }
    };
    const fetchEthUsdPrice = async () => {
      const data = await fetchTokenPrice(limitSubgraph, saleConfig.wethAddress)
      if (data["data"] && chainId == saleConfig.chainId) {
        const priceString = data["data"]["tokens"][0]?.usdPrice
        const newPrice = parseFloat(priceString)
        setEthUsdPrice(newPrice)
      }
    };
    fetchFinUsdPrice();
    fetchEthUsdPrice();
  }, [networkName, chainId]);


  useEffect(() => {
    if (!ethUsdPrice) return
    const startPrice = parseFloat(TickMath.getPriceStringAtSqrtPrice(startSqrtPrice, wethToken, finToken))
    setStartUsdPrice(`${(ethUsdPrice / startPrice).toFixed(2)}`)
    const endPrice = parseFloat(TickMath.getPriceStringAtSqrtPrice(endSqrtPrice, wethToken, finToken))
    setEndUsdPrice(`${(ethUsdPrice / endPrice).toFixed(2)}`)
  }, [ethUsdPrice]);

  const { data: filledAmount } = useContractRead({
    address: saleConfig.poolAddress,
    abi: limitPoolABI,
    functionName: "snapshotLimit",
    args: [
      {
        owner: saleConfig.ownerAddress,
        burnPercent: parseUnits("1", 38),
        positionId: saleConfig.limitPositionId,
        claim: saleConfig.finIsToken0 ? (-saleConfig.limitLP.upper) : saleConfig.limitLP.upper,
        zeroForOne: saleConfig.finIsToken0,
      }
    ],
    chainId: chainId,
    watch: true,
    enabled:
      chainId == saleConfig.chainId,
    onSuccess(data) {
      // console.log("Success price filled amount", data);
    },
    onError(error) {
      console.log("Error price Limit", error);
    },
    onSettled(data, error) {
      //console.log('Settled price Limit', { data, error })
    },
  });

  useEffect(() => {
    (async () => {
      if (isNaN(parseFloat(ethReceived)) || parseFloat(startUsdPrice) == 0 || parseFloat(endUsdPrice) == 0) return
      const liquidity = JSBI.BigInt(saleConfig.limitLP.liquidity)
      const ethAmount = JSBI.BigInt(parseUnits(ethReceived, 18))
      const currentSqrtPrice = TickMath.getNewSqrtPrice(startSqrtPrice, liquidity, ethAmount, true, true)
      const currentPrice = parseFloat(TickMath.getPriceStringAtSqrtPrice(currentSqrtPrice, wethToken, finToken))
      const currentUsdPrice = (ethUsdPrice / currentPrice).toFixed(2)
      const percentFill = (parseFloat(currentUsdPrice) - parseFloat(startUsdPrice)) / (parseFloat(endUsdPrice) - parseFloat(startUsdPrice))
      setPriceFill((100 - percentFill * 100) + '%')
      setIsLoading(false);
    })();
  }, [ethReceived, startUsdPrice, endUsdPrice, networkName]);

  useEffect(() => {
    if (!filledAmount || !filledAmount[0]) return
    setEthReceived(formatUnits(filledAmount[0], 18))
  }, [filledAmount]);

  const handleClick = async () => {
    if (chainId == saleConfig.chainId) {
      router.push(`/?chain=${chainProperties["fin-token"]["sale"]["chainId"]}&from=${chainProperties["fin-token"]["sale"]["wethAddress"]}&fromSymbol=ETH&to=${chainProperties["fin-token"]["sale"]["finAddress"]}&toSymbol=FIN`)
    } else {
      setNetworkName(chainIdsToNames[saleConfig.chainId]);
    }
  };

  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className="flex flex-col pt-10 pb-32 md:pb-0 text-white relative min-h-[calc(100vh-76px)] container mx-auto md:px-0 px-3">
        <div className="flex md:flex-row flex-col justify-between w-full items-start md:items-center gap-y-5">
          <div className="flex items-center gap-x-4">
            <div className="">
              <img height="70" width="70" src="https://poolshark-token-lists.s3.amazonaws.com/images/fin_icon.png" />
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="flex text-lg items-center text-white">
                <h1>
                  $FIN SALE
                </h1>
                <a
                  href={
                    `${chainProperties["fin-token"]["sale"]["explorerUrl"]}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-x-3 text-grey1 group cursor-pointer"
                >
                  <span className="-mb-1 text-light text-xs ml-8 group-hover:underline">

                  </span>{" "}
                  <ExternalLinkIcon />
                </a>
              </div>
              <div className="flex text-xs text-[#999999] items-center gap-x-3">
                STATUS:{" "}
                {isLoading ? (
                <div className="w-[117px] h-[20px] rounded-[4px] bg-grey/60" />
              ) : (
                <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                  {(parseFloat(ethReceived) / parseFloat(ethTotal) * 100).toFixed(2)}% FILLED
                </span>
              )}
                
              </div>
            </div>
          </div>

          <div className="flex items-center gap-x-4 w-full md:w-auto">
          {
            networkName == chainIdsToNames[saleConfig.chainId] ?
              (
                <Link href={`/?chain=${chainProperties["fin-token"]["sale"]["chainId"]}&from=${chainProperties["fin-token"]["sale"]["wethAddress"]}&fromSymbol=ETH&to=${chainProperties["fin-token"]["sale"]["finAddress"]}&toSymbol=FIN`}>
                <button
                  className="bg-main1 hover:opacity-80 transition-all border whitespace-nowrap w-full rounded-full text-center border-main transition-all py-2.5 px-20 text-sm uppercase cursor-pointer text-[13px] text-main2"
                >
                  {"BUY FIN"}
                </button>
                </Link>
              ) : (
                <button
                  className="bg-main1 hover:opacity-80 transition-all border whitespace-nowrap w-full rounded-full text-center border-main transition-all py-2.5 px-20 text-sm uppercase cursor-pointer text-[13px] text-main2"
                  onClick={() => handleClick()}
                >
                  {"SWITCH TO " + chainProperties[saleConfig.networkName]["chainName"]}
                </button>
              )
          }
          </div>
        </div>
        <div className=" w-full mt-8 gap-10">
          <div className="border h-min border-grey rounded-[4px] w-full p-5 pb-7">
            <div className="flex justify-between">
              <h1 className="uppercase text-white mb-2">STATISTICS</h1>
            </div>
            <div className="flex md:flex-row flex-col gap-6 mt-2">
              <div className="border w-full border-main rounded-[4px] flex flex-col w-full items-center justify-center gap-y-4 h-32 bg-main1 ">
                <span className="text-main2/60 text-[13px]">
                  CURRENT PRICE
                </span>
                {isLoading ? (
                <div className="h-[40px] w-36 bg-main/60 animate-pulse rounded-[4px]" />
              ) : (
                <span className="text-main2 lg:text-4xl text-3xl">
                  {price}
                </span>
              )}
                
              </div>
              <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-4 h-32">
                <span className="text-grey1 text-[13px]">TOTAL VALUE SOLD</span>
                {isLoading ? (
                <div className="h-[40px] w-[70%] bg-grey/30 animate-pulse rounded-[4px]" />
              ) : (
                <span className="text-white text-center xl:text-4xl md:text-3xl text-2xl">
                  ${(new Intl.NumberFormat('en-US')).format(parseFloat((parseFloat(ethReceived) * ethUsdPrice).toFixed(2)))}
                 <span className="text-grey2 md:text-base text-sm"> / ${(new Intl.NumberFormat('en-US')).format(parseFloat((parseFloat(ethTotal) * ethUsdPrice).toFixed(2)))}</span>
                </span>
              )}
                
              </div>
            </div>
          </div>
          <div className="mt-10  grid relative bg-dark border border-grey md:h-[350px] flex items-end">
          {isLoading ? (
                <div className="w-[157px] h-[34px] absolute bottom-6 lg:bottom-16 left-5 bg-grey/20 animate-pulse rounded-[4px]" />
              ) : (
                <div className="bg-black border-grey border px-5 py-2 rounded-[4px] absolute text-xs bottom-6 lg:bottom-16 left-5">
              <span className="text-white/70">Start Price:</span> ${startUsdPrice}
            </div>
              )}
              {isLoading ? (
                <div className="w-[157px] h-[34px] absolute bottom-6 md:bottom-auto md:top-4 right-5 bg-grey/20 animate-pulse rounded-[4px]" />
              ) : (
                <div className="bg-black border-grey border px-5 py-2 rounded-[4px] absolute text-xs bottom-6 md:bottom-auto md:top-4 right-5">
            <span className="text-white/70">End Price:</span> ${endUsdPrice}
            </div>
              )}
            
            
          <div className="svg-container bottom-0" style={{ position: 'relative', width: '100%', height: '300px' }}>
  <div className="absolute w-full h-full bottom-0 left-0 p-5">
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1432 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1431.17 0.196533C969.361 213.838 13.2114 259.935 0.178223 259.935H1431.17V0.196533Z"
        fill="#27282D"
        fillOpacity="0.4"
      />
    </svg>
  </div>
  <div className="absolute w-full h-full bottom-0 left-0 p-5 animatedFill" style={{ animationPlayState: 'running' }}>
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1433 262"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1432.17 1.19653C970.361 214.838 14.2114 260.935 1.17822 260.935H1432.17V1.19653Z"
        fill="#000A2C"
      />
      <path
        d="M1.17822 260.935C14.2114 260.935 970.361 214.838 1432.17 1.19653"
        stroke="#227BED"
        strokeLinecap="round"
      />
    </svg>
  </div>
</div>
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes fillAnimation {
            from {
              clip-path: inset(0 100% 0 0);
            }
            to {
              clip-path: inset(0 ${priceFill} 0 0);
            }
          }

          .animatedFill {
            animation: fillAnimation 2s forwards; /* Adjust time as needed */
          }
          .grid {
            background-image: radial-gradient(rgba(44, 46, 51, 0.4) 2px, transparent 2px);
background-size: 20px 20px;
background-color: #0B0C0C;
          }
        `}
      </style>
    </div>
  );
}
