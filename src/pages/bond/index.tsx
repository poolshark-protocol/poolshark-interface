import Navbar from "../../components/Navbar";
import ExternalLinkIcon from "../../components/Icons/ExternalLinkIcon";
import BuyBondButton from "../../components/Buttons/BuyBondButton";
import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { useAccount, useBalance, useContractRead } from "wagmi";
import {
  chainIdsToNamesForGitTokenList,
  chainProperties,
} from "../../utils/chains";
import { useConfigStore } from "../../hooks/useConfigStore";
import { bondTellerABI } from "../../abis/evm/bondTeller";
import { fetchBondMarket, fetchUserBonds } from "../../utils/queries";
import { mapBondMarkets, mapUserBondPurchases } from "../../utils/maps";

export default function Bond() {
  const { address } = useAccount()

  const [needsSubgraph, setNeedsSubgraph] = useState(true)
  const [needsBalance, setNeedsBalance] = useState(true)
  const [needsAllowance, setNeedsAllowance] = useState(true)

  const [
    chainId,
    networkName,
    limitSubgraph,
    coverSubgraph,
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
    state.limitSubgraph,
    state.coverSubgraph
  ]);

  const WETH_ADDRESS = "0x251f7eacde75458b52dbc4995c439128b9ef98ca"
  const TELLER_ADDRESS = "0x007FE70dc9797C4198528aE43d8195ffF82Bdc95"

  const [tokenBalance, setTokenBalance] = useState(null)
  const [tokenAllowance, setTokenAllowance] = useState(null)

  const [allUserBonds, setAllUserBonds] = useState(null)
  const [marketData, setMarketData] = useState(null)

  const [activeOrdersSelected, setActiveOrdersSelected] = useState(true);
  const abiCoder = new ethers.utils.AbiCoder();
  const abiData =
    abiCoder.encode(
      [ 
        "tuple(address payoutToken,address quoteToken,address callbackAddr,bool capacityInQuote,uint256 capacity,uint256 formattedPrice,uint48 depositInterval,uint48 vesting,uint48 start,uint48 duration,int8 scaleAdjustment)",
      ],
      [{
        payoutToken: "0x742510a23bf83be959990a510ccae40b2d3d9b83",
        quoteToken: "0x251f7eacde75458b52dbc4995c439128b9ef98ca",
        callbackAddr: "0x0000000000000000000000000000000000000000",
        capacityInQuote: false,
        capacity: "10000000000000000000000",
        formattedPrice: "1000000000000000",
        depositInterval: "3600",
        vesting: "7200",
        start: "1699545600",
        duration: "604800",
        scaleAdjustment: "0"
      }]
    )

  console.log(abiData);

  const { data: tokenBalanceData } = useBalance({
    address: address,
    token: WETH_ADDRESS,
    enabled: WETH_ADDRESS != undefined && needsBalance,
    watch: needsBalance,
  });

  useEffect(() => {
    if (tokenBalanceData) {
      setTokenBalance(tokenBalanceData)
      setNeedsBalance(false)
    }
  }, [tokenBalance])

  const { data: tokenAllowanceData } = useContractRead({
    address: TELLER_ADDRESS,
    abi: bondTellerABI,
    functionName: "allowance",
    args: [address, chainProperties[networkName]["routerAddress"]],
    chainId: chainId,
    watch: needsAllowance,
    enabled: TELLER_ADDRESS != undefined,
  });

  useEffect(() => {
    if (tokenAllowanceData) {
      setTokenAllowance(tokenAllowanceData)
      setNeedsAllowance(false)
    }
  }, [tokenAllowanceData])

  async function getUserBonds() {
    try {
      const data = await fetchUserBonds(
        address?.toLowerCase(),
        "FIN"
      );
      if (data["data"]) {
        setAllUserBonds(
          mapUserBondPurchases(data["data"].bondPurchases)
        );
      }
    } catch (error) {
      console.log("user bond subgraph error", error);
    }
  }

  async function getMarket() {
    try {
      const data = await fetchBondMarket("43");
      console.log(data, "market data")
      if (data["data"]) {
        setMarketData(
          mapBondMarkets(data["data"].markets)
        );
      }
    }
    catch (error) {
      console.log("market subgraph error", error);
    }
  }

  useEffect(() => {
    getMarket();
    getUserBonds();
    setNeedsSubgraph(false);
    console.log(marketData, "market data")
    console.log(allUserBonds, "user bonds")
  }, []);

  useEffect(() => {
    if (address && needsSubgraph) {
      getMarket();
      getUserBonds();
      setNeedsSubgraph(false);
      console.log(marketData, "market data")
      console.log(allUserBonds, "user bonds")
    }
  }, [needsSubgraph]);

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
                <h1>$FIN BOND</h1>
                <a
                  href={"https://goerli.arbiscan.io/address/" + "PoolAddress"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-x-3 text-grey1 group cursor-pointer"
                >
                  <span className="-mb-1 text-light text-xs ml-8 group-hover:underline">
                    0x123...456
                  </span>{" "}
                  <ExternalLinkIcon />
                </a>
              </div>
              <div className="flex text-xs text-[#999999] items-center gap-x-3">
                END DATE:{" "}
                <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                  12/12/2023
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-x-4 w-full md:w-auto">
            <button className="bg-black border whitespace-nowrap w-full border-grey transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px] text-grey1">
              How does it work?
            </button>
          </div>
        </div>
        <div className="flex lg:flex-row flex-col justify-between w-full mt-8 gap-10">
          <div className="border border-grey rounded-[4px] lg:w-1/2 w-full p-5 pb-7">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">STATISTICS</h1>
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="flex items-center gap-x-5 mt-3">
                <div className="border border-main rounded-[4px] flex flex-col w-full items-center justify-center gap-y-4 h-32 bg-main1 ">
                  <span className="text-main2/60 text-[13px]">BOND PRICE</span>
                  <span className="text-main2 text-2xl md:text-4xl">$1.24</span>
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
                <span className="text-white text-4xl">$353,452.53</span>
              </div>
            </div>
            <div className="flex flex-col gap-y-3 mt-5">
              <div className="flex justify-between ">
                <h1 className="uppercase text-white">REMAINING CAPACITY</h1>
                <span>
                  50,432.54 <span className="text-grey1">FIN</span>
                </span>
              </div>
              <div className="bg-main2 relative h-10 rounded-full w-full">
                <div className="absolute relative flex items-center justify-center h-[38px] bg-main1 w-[60%] rounded-full ml-[1px] mt-[1px]">
                  <div className="text-sm text-main2">60% FILLED</div>
                </div>
              </div>
            </div>
          </div>
          <div className="border bg-dark border-grey rounded-[4px] lg:w-1/2 w-full p-5 pb-7 h-full">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">BUY BOND</h1>
            </div>
            <div className="flex flex-col gap-y-7">
              <div className="border border-grey bg-black rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  <span>~$0.00</span>
                  <span>BALANCE: 0</span>
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  <input className="bg-black" />
                  <div className="flex items-center gap-x-2 ">
                    <button className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border md:block hidden">
                      MAX
                    </button>
                    <div className="flex items-center gap-x-2">
                      <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                        <img
                          height="28"
                          width="25"
                          src="/static/images/dai_icon.png"
                        />
                        USDC
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-y-4 border-grey border rounded-[4px] text-xs p-5">
                <div className="flex justify-between w-full text-grey1">
                  YOU WILL GET <span className="text-white">60 FIN</span>
                </div>
                {/*<div className="flex justify-between w-full text-grey1">
                  DAILY UNLOCK <span className="text-white">0.5 FIN</span>
                </div>*/}
                <div className="flex justify-between w-full text-grey1">
                  MAX BONDABLE <span className="text-white">6000 USDC</span>
                </div>
                <div className="flex justify-between w-full text-grey1">
                  UNLOCK DATE <span className="text-white">2023.11.05</span>
                </div>
              </div>
              {/*<BuyBondButton
                inputAmount={ethers.utils.parseEther("100")}
                setNeedsSubgraph={setNeedsSubgraph}
                marketId={marketData?.marketId}
              />*/}
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
                  ALL TRANSACTIONS
                </button>
                <button
                  className={`px-5 py-2 w-full md:w-auto ${
                    !activeOrdersSelected
                      ? "bg-main1 border border-main"
                      : "bg-black border-r border-t border-b border-grey"
                  }`}
                  onClick={() => setActiveOrdersSelected(false)}
                >
                  MY HISTORY
                </button>
              </div>
            </div>
            <div className="overflow-hidden rounded-[4px] mt-3 bg-dark  border border-grey">
              <table className="w-full table-auto rounded-[4px]">
                <thead>
                  <tr className="text-[11px] text-grey1/90 mb-3 leading-normal">
                    <th className="text-left pl-3 py-3 uppercase">DATE</th>
                    <th className="text-left uppercase">BOND AMOUNT</th>
                    <th className="text-left uppercase">PAYOUT AMOUNT</th>
                    <th className="text-left uppercase">DISCOUNT</th>
                    <th className="text-left uppercase">DAILY UNLOCK</th>
                    <th className="text-left uppercase">UNLOCK DATE</th>
                    <th className="text-left uppercase">TRANSACTION</th>
                    <th className="text-left uppercase">ADDRESS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey/70">
                  <tr className="text-left text-xs py-2 md:text-sm bg-black cursor-pointer">
                    <td className="pl-3 py-2">2023.10.28</td>
                    <td className="">
                      <div className="flex gap-x-1.5 items-center">
                        <img
                          className="w-6"
                          src="/static/images/dai_icon.png"
                        />
                        500 USDC
                      </div>
                    </td>
                    <td className="">
                      <div className="flex gap-x-1.5 items-center">
                        <img
                          className="w-6"
                          src="/static/images/fin_icon.png"
                        />
                        845 FIN
                      </div>
                    </td>
                    <td className="">0.9%</td>
                    <td className="">0.94 FIN</td>
                    <td className="">2024.10.28</td>
                    <td className="text-grey1">
                      {" "}
                      <div className="flex gap-x-1.5 items-center">
                        0x123...456 <ExternalLinkIcon />
                      </div>
                    </td>
                    <td className="text-grey1">
                      <div className="flex gap-x-1.5 items-center">
                        0x123...456 <ExternalLinkIcon />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
