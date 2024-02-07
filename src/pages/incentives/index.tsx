import Navbar from "../../components/Navbar";
import Info from "../../components/Icons/InfoIcon";
import ClaimRewardsButton from "../../components/Buttons/ClaimRewardsButton";
import { CheckIcon } from "@heroicons/react/20/solid";
import { ethers } from "ethers";
import { useAccount, useProvider } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useEffect } from "react";
import { fetchSeason1Rewards } from "../../utils/queries";
import { useIncentivesStore } from "../../hooks/useIncentivesStore";

export default function Incentives() {

  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const signer = new ethers.VoidSigner(address, provider);

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
    userSeason1FINTotal,
    userSeason1FIN,
    totalSeason1FIN,
    userSeason1Points,
    totalSeason1Points,
    setTokenClaim,
    setUserSeason1FIN,
    setUserSeason1FINTotal,
    setUserSeason1Points,
    setTotalSeason1Points
  ] = useIncentivesStore((state) => [
    state.tokenClaim,
    state.userSeason1FINTotal,
    state.userSeason1FIN,
    state.totalSeason1FIN,
    state.userSeason1Points,
    state.totalSeason1Points,
    state.setTokenClaim,
    state.setUserSeason1FIN,
    state.setUserSeason1FINTotal,
    state.setUserSeason1Points,
    state.setTotalSeason1Points,
  ]);

  useEffect(() => {
    if (isConnected) {
      const userFINRewards = {
        whitelistedFeesUsd:
          userSeason1Points.whitelistedFeesUsd > 0
          ? totalSeason1FIN.whitelistedFeesUsd
            * userSeason1Points.whitelistedFeesUsd 
            / totalSeason1Points.whitelistedFeesUsd
          : 0,
        nonWhitelistedFeesUsd:
          userSeason1Points.nonWhitelistedFeesUsd > 0
          ? totalSeason1FIN.nonWhitelistedFeesUsd
            * userSeason1Points.nonWhitelistedFeesUsd 
            / totalSeason1Points.nonWhitelistedFeesUsd
          : 0,
        stakingPoints:
          userSeason1Points.stakingPoints > 0
          ? totalSeason1FIN.stakingPoints
          * userSeason1Points.stakingPoints 
          / totalSeason1Points.stakingPoints
          : 0,
        volumeTradedUsd:
          userSeason1Points.volumeTradedUsd > 0
          ? totalSeason1FIN.volumeTradedUsd
          * userSeason1Points.volumeTradedUsd 
          / totalSeason1Points.volumeTradedUsd
          : 0,
      }
      console.log('lp rewards:', userFINRewards.whitelistedFeesUsd + userFINRewards.nonWhitelistedFeesUsd)
      setUserSeason1FIN(userFINRewards)
      setUserSeason1FINTotal(
        userFINRewards.whitelistedFeesUsd
        + userFINRewards.nonWhitelistedFeesUsd
        + userFINRewards.stakingPoints
        + userFINRewards.volumeTradedUsd
      )
    }
  }, [
    userSeason1Points,
    totalSeason1Points
  ]);

  useEffect(() => {
    if (isConnected) {
      updateSeasonRewards()
    }
  }, [
    address
  ]);

  async function updateSeasonRewards() {
    const data = await fetchSeason1Rewards(limitSubgraph, address);
    if (data["data"]) {
      if (data["data"].totalSeasonRewards?.length == 1) {
        setTotalSeason1Points(data["data"].totalSeasonRewards[0])
      }
      if (data["data"].userSeasonRewards?.length == 1) {
        console.log('user season rewards', data["data"].userSeasonRewards)
        setUserSeason1Points(data["data"].userSeasonRewards[0])
      }
    }
  }

  return (
    <div className=" bg-no-repeat bg-black min-h-screen pb-20">
      <Navbar />
      <div className="flex justify-center w-full text-white container mx-auto">
        <div className="w-full mt-8">
        <div className="w-full border border-grey p-7 flex flex-col justify-between">
            <div className="flex flex-col gap-y-3 mb-10">
              <h1 className="uppercase text-white">How Fincentives work</h1>
              <p className="text-sm text-grey3 font-light">
                FINcentives split revenue between short-term stakeholders and long-term stakeholders.
                <br/><br/>
                Liquidity Miners are able to purchase FIN at a fixed price or discount to market.
                <br/><br/>
                The FIN Treasury then receives revenue from Liquidity Miners to back FIN and increase RFV.
                <br/><br/>
                Step 1: Deposit liquidity or swap tokens
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
          <div className="w-full mb-5">
            <div className="flex lg:flex-row flex-col h-full gap-5  mt-5">
              <div className="bg-dark border border-grey p-5 w-full">
                <h1>oFIN EARNED</h1>
                <div className="flex md:flex-row flex-col gap-5 mt-5">
                  <div className="border border-grey w-full rounded-[4px] bg-black flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs uppercase">
                      Trading Rewards
                    </span>
                    <span className="text-white text-2xl md:text-3xl">
                      {userSeason1FIN.volumeTradedUsd ? userSeason1FIN.volumeTradedUsd.toPrecision(6) : 0}
                    </span>
                  </div>

                  <div className="border border-grey w-full rounded-[4px] bg-black flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs uppercase">
                      LP Rewards
                    </span>
                    <span className="text-white text-2xl md:text-3xl">
                      {userSeason1FIN.whitelistedFeesUsd + userSeason1FIN.nonWhitelistedFeesUsd === 0 ? 0 : (userSeason1FIN.whitelistedFeesUsd + userSeason1FIN.nonWhitelistedFeesUsd).toPrecision(6)}
                    </span>
                  </div>
                  {/* <div className="border border-grey w-full rounded-[4px] bg-black flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs uppercase">
                      FIN Staking Rewards
                    </span>
                    <span className="text-white text-2xl md:text-3xl">
                      {userSeason1FIN.stakingPoints.toPrecision(6)}
                    </span>
                  </div> */}
                  <div className="border border-main w-full rounded-[4px] bg-main1 flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-white/20 text-xs uppercase">
                      Total Rewards
                    </span>
                    <span className="text-main2 text-2xl md:text-3xl">
                    {userSeason1FINTotal === 0 ? 0 : userSeason1FINTotal.toPrecision(6)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border h-full bg-dark border-grey rounded-[4px] lg:w-[80%] w-full p-5">
                <div className="flex justify-between">
                  <h1 className="uppercase text-white">
                    Rewards Available to Claim
                  </h1>
                </div>

                <div className="flex flex-col gap-y-3 mt-2">
                  <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
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
                            src="/static/images/fin_icon.png"
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
            Vesting 
          </div>
          <div className="flex flex-col gap-y-1 mt-6 mb-5 px-5">
                  <div className="flex items-center">
                    <span className="text-xs w-5 flex items-center justify-center text-white">
                      12/01
                    </span>
                    <div className="w-full h-[2px]" />
                    <span className="text-xs w-5 flex items-center justify-center text-white">
                      18/01
                    </span>
                    <div className="w-full h-[2px]" />
                    <span className="text-xs w-5 flex items-center justify-center text-grey1">
                      24/01
                    </span>
                    <div className="w-full h-[2px]" />
                    <span className="text-xs w-5 flex items-center justify-center text-grey1">
                      30/01
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 aspect-square bg-main2 rounded-full relative flex items-center justify-center">
                      <CheckIcon className="w-4" />
                    </div>
                    <div className="w-full h-[2px] bg-main2" />
                    <div className="w-6 h-6 aspect-square bg-main2 rounded-full" />
                    <div className="w-full h-[2px] bg-main" />
                    <div className="w-6 h-6 aspect-square bg-main rounded-full" />
                    <div className="w-full h-[2px] bg-main" />
                    <div className="w-6 h-6 aspect-square bg-main rounded-full" />
                  </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
}