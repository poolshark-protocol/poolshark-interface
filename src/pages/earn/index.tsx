import Navbar from "../../components/Navbar";
import Info from "../../components/Icons/InfoIcon";
import ClaimRewardsButton from "../../components/Buttons/ClaimRewardsButton";
import { CheckIcon } from "@heroicons/react/20/solid";
import { ethers } from "ethers";
import { useAccount, useProvider } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useEffect, useState } from "react";
import { fetchSeasonRewards } from "../../utils/queries";
import { useEarnStore } from "../../hooks/useEarnStore";
import { chainProperties } from "../../utils/chains";
import { useState } from "react";

export default function Earn() {

  const { address, isConnected } = useAccount();
  const [ block, setBlock ] = useState("Block 1")
  const provider = useProvider();
  const signer = new ethers.VoidSigner(address, provider);
  const [isLoading, setIsLoading] = useState(true);

  const [
    chainId,
    networkName,
    limitSubgraph,
    coverSubgraph,
    coverFactoryAddress,
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
    state.limitSubgraph,
    state.coverSubgraph,
    state.coverFactoryAddress,
  ]);

  const [
    tokenClaim,
    setTokenClaim,
    userSeason0Block1FINTotal,
    userSeason0Block1FIN,
    totalSeason0Block1FIN,
    userSeason0Block1Points,
    totalSeason0Block1Points,
    setUserSeason0Block1FIN,
    setUserSeason0Block1FINTotal,
    setUserSeason0Block1Points,
    setTotalSeason0Block1Points,
    userSeason0Block2FINTotal,
    userSeason0Block2FIN,
    totalSeason0Block2FIN,
    userSeason0Block2Points,
    totalSeason0Block2Points,
    setUserSeason0Block2FIN,
    setUserSeason0Block2FINTotal,
    setUserSeason0Block2Points,
    setTotalSeason0Block2Points
  ] = useEarnStore((state) => [
    state.tokenClaim,
    state.setTokenClaim,
    state.userSeason0Block1FINTotal,
    state.userSeason0Block1FIN,
    state.totalSeason0Block1FIN,
    state.userSeason0Block1Points,
    state.totalSeason0Block1Points,
    state.setUserSeason0Block1FIN,
    state.setUserSeason0Block1FINTotal,
    state.setUserSeason0Block1Points,
    state.setTotalSeason0Block1Points,
    state.userSeason0Block2FINTotal,
    state.userSeason0Block2FIN,
    state.totalSeason0Block2FIN,
    state.userSeason0Block2Points,
    state.totalSeason0Block2Points,
    state.setUserSeason0Block2FIN,
    state.setUserSeason0Block2FINTotal,
    state.setUserSeason0Block2Points,
    state.setTotalSeason0Block2Points,
  ]);

  useEffect(() => {
    if (isConnected) {
      if (userSeason0Block1Points && 
            chainProperties[networkName]?.season0Rewards) {
        const totalSeason0Rewards = chainProperties[networkName]
                                        ?.season0Rewards?.block1?.whitelistedFeesUsd
        const userFINRewards = {
          whitelistedFeesUsd:
            userSeason0Block1Points.whitelistedFeesUsd > 0
            ? (totalSeason0Rewards ?? 0)
              * userSeason0Block1Points.whitelistedFeesUsd
              / totalSeason0Block1Points.whitelistedFeesUsd
            : 0,
        }
        setUserSeason0Block1FIN(userFINRewards)
        setUserSeason0Block1FINTotal(
          userFINRewards.whitelistedFeesUsd
        )
      } else {
        const userFINRewards = {
          whitelistedFeesUsd: 0,
        }
        setUserSeason0Block1FIN(userFINRewards)
        setUserSeason0Block1FINTotal(0)
      }
    }
  }, [
    userSeason0Block1Points,
    totalSeason0Block1Points
  ]);

  useEffect(() => {
    if (isConnected) {
      updateSeasonRewards()
    }
  }, [
    address,
    limitSubgraph
  ]);

  async function updateSeasonRewards() {
    const data = await fetchSeasonRewards(limitSubgraph, address);
    if (data["data"]) {
      const season0Block1Total = data["data"].totalSeasonRewards.find((rewards) => {
        console.log('rewards check:', rewards)
        return rewards.season == 0 && rewards.block == 1
      })
      console.log('season 0 block 1:', season0Block1Total)
      if (season0Block1Total) {
        setTotalSeason0Block1Points(season0Block1Total)
      }
      const season0Block1User = data["data"].userSeasonRewards.find((rewards) => {
        console.log('rewards check:', rewards)
        return rewards.season == 0 && rewards.block == 1
      })
      if (season0Block1User) {
        setUserSeason0Block1Points(season0Block1User)
      } else {
        setTotalSeason0Block1Points(undefined)
        setUserSeason0Block1Points(undefined)
      }
      const season0Block2Total = data["data"].totalSeasonRewards.find((rewards) => {
        console.log('rewards check:', rewards)
        return rewards.season == 0 && rewards.block == 1
      })
      console.log('season 0 block 1:', season0Block2Total)
      if (season0Block2Total) {
        setTotalSeason0Block2Points(season0Block2Total)
      }
      const season0Block2User = data["data"].userSeasonRewards.find((rewards) => {
        console.log('rewards check:', rewards)
        return rewards.season == 0 && rewards.block == 1
      })
      if (season0Block2User) {
        setUserSeason0Block2Points(season0Block2User)
      } else {
        setTotalSeason0Block2Points(undefined)
        setUserSeason0Block2Points(undefined)
      }
    }
    setIsLoading(false)
  }
  const blocks = ["Block 1", "Block 2"];

  return (
    <div className=" bg-no-repeat bg-black min-h-screen pb-20 md:pb-5">
      <Navbar />
      <div className="flex justify-center w-full text-white container mx-auto">
        <div className="w-full mt-8">
        <div className="w-full border border-grey p-7 flex flex-col justify-between">
            <div className="flex flex-col gap-y-3 mb-10">
              <h1 className="uppercase text-white">How Fincentives work</h1>
              <p className="text-[12px] text-grey3 font-light">
                FINcentives split revenue between short-term stakeholders and long-term stakeholders.
                <br/><br/>
                Liquidity Miners are able to purchase FIN at a fixed price or discount to market.
                <br/><br/>
                The FIN Treasury then receives revenue from Liquidity Miners to increase RFV.
                <br/><br/>
                Step 1: Deposit liquidity on supported pairs
                <br/>
                Step 2: Track your oFIN using this page
                <br/>
                Step 3: Claim your oFIN when the drop starts
                <br/>
                Step 4: Convert your oFIN to FIN
                <br/>
              </p>
            </div>
            <a
              href="https://docs.poolshark.fi/token/why-ofin"
              target="_blank"
              rel="noreferrer"
              className="text-grey3 underline text-sm flex items-center gap-x-2 font-light"
            >
              <Info />
              Read More
            </a>
          </div>
          <div className="flex justify-start text-sm mt-5">
            {blocks.map((blockName, index) => (
              <div key={index} className="relative">
              <button className={`py-2 ${block === blockName ? 'bg-main1 text-main2 border-main' : 'bg-dark text-grey1 border-transparent'} border flex items-center gap-x-2 rounded-[4px] px-5 mr-2`} onClick={() => setBlock(blockName)}>
                {blockName}
              </button>
              </div>
            ))}
          </div>
          <div className="w-full mb-5">
            <div className="flex lg:flex-row flex-col h-full gap-5  mt-5">
              <div className="bg-dark border border-grey p-5 w-full">
                <h1>TOTAL oFIN EARNED</h1>
                <div className="flex md:flex-row flex-col gap-5 mt-5">
                  {/* <div className="border border-grey w-full rounded-[4px] bg-black flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs uppercase">
                      Trading Rewards
                    </span>
                    <span className="text-white text-2xl md:text-3xl">
                      {userSeason0Block1FIN.volumeTradedUsd ? userSeason0Block1FIN.volumeTradedUsd.toPrecision(6) : 0}
                    </span>
                  </div> */}

                  <div className="border border-grey w-full rounded-[4px] bg-black flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs uppercase">
                      LP Rewards
                    </span>
                    {isLoading ?
                    <div className="h-[36px] rounded-[4px] w-40 bg-grey/60 animate-pulse" />
                     : <span className="text-white text-2xl md:text-3xl">
                     {block === "Block 1" && (userSeason0Block1FIN?.whitelistedFeesUsd === 0 ? (0).toFixed(2) : userSeason0Block1FIN.whitelistedFeesUsd.toFixed(2))}
                     {block === "Block 2" && (userSeason0Block2FIN?.whitelistedFeesUsd === 0 ? (0).toFixed(2) : userSeason0Block2FIN.whitelistedFeesUsd.toFixed(2))}
                   </span>
                    }
                  </div>
                  {/* <div className="border border-grey w-full rounded-[4px] bg-black flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs uppercase">
                      FIN Staking Rewards
                    </span>
                    <span className="text-white text-2xl md:text-3xl">
                      {userSeason0Block1FIN.stakingPoints.toPrecision(6)}
                    </span>
                  </div> */}
                    {/* <div className="border border-main w-full rounded-[4px] bg-main1 flex flex-col w-full items-center justify-center gap-y-3 h-32">
                      <span className="text-white/20 text-xs uppercase">
                        Total Rewards
                      </span>
                      <span className="text-main2 text-2xl md:text-3xl">
                      {userSeason0Block1FINTotal === 0 ? 0 : userSeason0Block1FINTotal.toPrecision(6)}
                      </span>
                    </div> */}
                </div>
                <div className="flex items-center justify-between mt-5">
                <h1 className="text-grey1 text-sm">Total across all blocks</h1>
                <span>{((userSeason0Block1FIN?.whitelistedFeesUsd + userSeason0Block2FIN?.whitelistedFeesUsd) === 0 ? (0).toFixed(2) : (userSeason0Block1FIN.whitelistedFeesUsd + userSeason0Block2FIN?.whitelistedFeesUsd).toFixed(2))} oFIN</span>
                </div>
              </div>
              <div className="border h-full bg-dark border-grey rounded-[4px] w-full p-5">
                <div className="flex justify-between">
                  <h1 className="uppercase text-white">
                    Rewards Available to Claim
                  </h1>
                </div>

                <div className="flex flex-col gap-y-3 mt-5">
                  <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 flex flex-col gap-y-2">
                    <div className="flex items-end justify-between text-[11px] text-grey1">
                      <span>~$0.00</span>
                    </div>
                    <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                      0.00
                      <div className="flex items-center gap-x-2">
                        <div className="w-full text-xs whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                          <img
                            height="25"
                            width="25"
                            src="https://poolshark-token-lists.s3.amazonaws.com/images/fin_icon.png"
                          />
                          oFIN
                        </div>
                      </div>
                    </div>
                  </div>
                  <ClaimRewardsButton />
                </div>
              </div>
            </div>
          </div>
          <div className="p-5 border border-grey bg-dark">
          <div className="uppercase">
            Rewards Schedule
          </div>
          <div className="flex flex-col gap-y-1 mt-6 mb-5 px-5">
                  <div className="flex items-center mb-2">
                  {block === "Block 1" && (<span className={`text-xs w-5 flex items-center justify-center ${new Date() > new Date('2024-02-09') ? 'text-white' : 'text-grey1'}`}>
                    02/09
                    </span>)}
                    {block === "Block 2" && (<span className={`text-xs w-5 flex items-center justify-center ${new Date() > new Date('2024-03-09') ? 'text-white' : 'text-grey1'}`}>
                    03/09
                    </span>)}
                    
                    <div className="w-full h-[2px]" />
                    {block === "Block 1" && (<span className={`text-xs w-5 flex items-center justify-center ${new Date() > new Date('2024-03-09') ? 'text-white' : 'text-grey1'}`}>
                    03/09
                    </span>)}
                    {block === "Block 2" && (<span className={`text-xs w-5 flex items-center justify-center ${new Date() > new Date('2024-04-09') ? 'text-white' : 'text-grey1'}`}>
                    04/09
                    </span>)}
                    <div className="w-full h-[2px]" />
                    <span className={`text-xs w-5 flex items-center justify-center ${new Date() > new Date('2025-00-00') ? 'text-white' : 'text-grey1'}`}>
                      ??/??
                    </span>
                    <div className="w-full h-[2px]" />
                    <span className={`text-xs w-5 flex items-center justify-center ${new Date() > new Date('2025-00-00') ? 'text-white' : 'text-grey1'}`}>
                      ??/??
                    </span>
                  </div>
                  <div className="flex items-center">
                  {block === "Block 1" && ( <div className={`w-6 h-6 aspect-square ${new Date() > new Date('2024-02-09') ? 'bg-main2' : 'bg-main'} rounded-full`} />)}
                  {block === "Block 2" && ( <div className={`w-6 h-6 aspect-square ${new Date() > new Date('2024-03-09') ? 'bg-main2' : 'bg-main'} rounded-full`} />)}

                  {block === "Block 1" && ( <div className={`w-full h-[2px] aspect-square ${new Date() > new Date('2024-03-09') ? 'bg-main2' : 'bg-main'}`} />)}
                  {block === "Block 2" && ( <div className={`w-full h-[2px] aspect-square ${new Date() > new Date('2024-04-09') ? 'bg-main2' : 'bg-main'}`} />)}

                  {block === "Block 1" && ( <div className={`w-6 h-6 aspect-square ${new Date() > new Date('2024-03-09') ? 'bg-main2' : 'bg-main'} rounded-full`} />)}
                  {block === "Block 2" && ( <div className={`w-6 h-6 aspect-square ${new Date() > new Date('2024-04-09') ? 'bg-main2' : 'bg-main'} rounded-full`} />)}
                  
                    <div className={`w-full h-[2px] aspect-square ${new Date() > new Date('2025-00-00') ? 'bg-main2' : 'bg-main'}`} />
                    <div className={`w-6 h-6 aspect-square ${new Date() > new Date('2025-00-00') ? 'bg-main2' : 'bg-main'} rounded-full`} />
                    <div className={`w-full h-[2px] aspect-square ${new Date() > new Date('2025-00-00') ? 'bg-main2' : 'bg-main'}`} />
                    <div className={`w-6 h-6 aspect-square ${new Date() > new Date('2025-00-00') ? 'bg-main2' : 'bg-main'} rounded-full`} />
                  </div>
                  <div className="flex items-center mt-2">
                  <span className={`text-xs w-5 flex items-center justify-center ${new Date() > new Date('2024-02-09') ? 'text-white' : 'text-grey1'}`}>
                      START
                    </span>
                    <div className="w-full h-[2px]" />
                    <span className={`text-xs w-5 flex items-center justify-center ${new Date() > new Date('2024-03-09') ? 'text-white' : 'text-grey1'}`}>
                      SNAPSHOT
                    </span>
                    <div className="w-full h-[2px]" />
                    <span className={`text-xs w-5 flex items-center justify-center ${new Date() > new Date('2025-00-00') ? 'text-white' : 'text-grey1'}`}>
                      DROP
                    </span>
                    <div className="w-full h-[2px]" />
                    <span className={`text-xs w-5 flex items-center justify-center ${new Date() > new Date('2025-00-00') ? 'text-white' : 'text-grey1'}`}>
                      END
                    </span>
                  </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
}