import Navbar from "../../components/Navbar";
import Info from "../../components/Icons/InfoIcon";
import ClaimRewardsButton from "../../components/Buttons/ClaimRewardsButton";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useAccount } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useEffect, useState } from "react";
import { fetchSeason1Rewards } from "../../utils/queries";
import { useEarnStore } from "../../hooks/useEarnStore";
import { chainProperties } from "../../utils/chains";
import { formatOFin } from "../../utils/math/valueMath";
import { useShallow } from "zustand/react/shallow";
export default function Earn() {
  const { address, isConnected } = useAccount();
  const [block, setBlock] = useState("Block 1");
  const [isLoading, setIsLoading] = useState(true);

  const [networkName, limitSubgraph] = useConfigStore(
    useShallow((state) => [state.networkName, state.limitSubgraph]),
  );

  // @shax
  const earnStore = useEarnStore();

  useEffect(() => {
    if (isConnected) {
      if (
        earnStore.userSeason0Block1Points &&
        chainProperties[networkName]?.season0Rewards?.block1
      ) {
        const totalSeason0Block1Rewards =
          chainProperties[networkName]?.season0Rewards?.block1
            ?.whitelistedFeesUsd;
        const userFINRewards = {
          whitelistedFeesUsd:
            earnStore.userSeason0Block1Points.whitelistedFeesUsd > 0
              ? ((totalSeason0Block1Rewards ?? 0) *
                  earnStore.userSeason0Block1Points.whitelistedFeesUsd) /
                earnStore.totalSeason0Block1Points.whitelistedFeesUsd
              : 0,
        };
        earnStore.setUserSeason0Block1FIN(userFINRewards);
        earnStore.setUserSeason0Block1FINTotal(
          userFINRewards.whitelistedFeesUsd,
        );
      } else {
        const userFINRewards = {
          whitelistedFeesUsd: 0,
        };
        earnStore.setUserSeason0Block1FIN(userFINRewards);
        earnStore.setUserSeason0Block1FINTotal(0);
      }
      if (
        earnStore.userSeason0Block2Points &&
        chainProperties[networkName]?.season0Rewards?.block2
      ) {
        const totalSeason0Block2Rewards =
          chainProperties[networkName]?.season0Rewards?.block2
            ?.whitelistedFeesUsd;
        const userFINRewards = {
          whitelistedFeesUsd:
            earnStore.userSeason0Block2Points.whitelistedFeesUsd > 0
              ? ((totalSeason0Block2Rewards ?? 0) *
                  earnStore.userSeason0Block2Points.whitelistedFeesUsd) /
                earnStore.totalSeason0Block2Points.whitelistedFeesUsd
              : 0,
        };
        earnStore.setUserSeason0Block2FIN(userFINRewards);
        earnStore.setUserSeason0Block2FINTotal(
          userFINRewards.whitelistedFeesUsd,
        );
      } else {
        const userFINRewards = {
          whitelistedFeesUsd: 0,
        };
        earnStore.setUserSeason0Block2FIN(userFINRewards);
        earnStore.setUserSeason0Block2FINTotal(0);
      }
    }
  }, [
    earnStore.userSeason0Block1Points,
    earnStore.totalSeason0Block1Points,
    earnStore.userSeason0Block2Points,
    earnStore.totalSeason0Block2Points,
  ]);

  useEffect(() => {
    if (isConnected) {
      updateSeasonRewards();
    }
  }, [address, limitSubgraph]);

  async function updateSeasonRewards() {
    const data = await fetchSeason1Rewards(limitSubgraph, address);
    if (data["data"]) {
      const season0Block1Total = data["data"].totalSeasonRewards.find(
        (rewards) => {
          return rewards.season == 0 && rewards.block == 1;
        },
      );
      if (season0Block1Total) {
        earnStore.setTotalSeason0Block1Points(season0Block1Total);
      }
      const season0Block1User = data["data"].userSeasonRewards.find(
        (rewards) => {
          return rewards.season == 0 && rewards.block == 1;
        },
      );
      if (season0Block1User) {
        earnStore.setUserSeason0Block1Points(season0Block1User);
      } else {
        earnStore.setTotalSeason0Block1Points(undefined);
        earnStore.setUserSeason0Block1Points(undefined);
      }
      const season0Block2Total = data["data"].totalSeasonRewards.find(
        (rewards) => {
          return rewards.season == 0 && rewards.block == 2;
        },
      );
      if (season0Block2Total) {
        earnStore.setTotalSeason0Block2Points(season0Block2Total);
      }
      const season0Block2User = data["data"].userSeasonRewards.find(
        (rewards) => {
          return rewards.season == 0 && rewards.block == 2;
        },
      );
      if (season0Block2User) {
        earnStore.setUserSeason0Block2Points(season0Block2User);
      } else {
        earnStore.setTotalSeason0Block2Points(undefined);
        earnStore.setUserSeason0Block2Points(undefined);
      }
    }
    setIsLoading(false);
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
                FINcentives split revenue between short-term stakeholders and
                long-term stakeholders.
                <br />
                <br />
                Liquidity Miners are able to purchase FIN at a fixed price or
                discount to market.
                <br />
                <br />
                The FIN Treasury then receives revenue from Liquidity Miners to
                increase RFV.
                <br />
                <br />
                Step 1: Deposit liquidity on supported pairs
                <br />
                Step 2: Compound or Collect on all positions
                <br />
                Step 3: Track your oFIN using this page
                <br />
                Step 4: Claim your oFIN when the drop starts
                <br />
                Step 5: Convert your oFIN to FIN
                <br />
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
                <button
                  className={`py-2 ${
                    block === blockName
                      ? "bg-main1 text-main2 border-main"
                      : "bg-dark text-grey1 border-transparent"
                  } border flex items-center gap-x-2 rounded-[4px] px-5 mr-2`}
                  onClick={() => setBlock(blockName)}
                >
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
                    {isLoading ? (
                      <div className="h-[36px] rounded-[4px] w-40 bg-grey/60 animate-pulse" />
                    ) : (
                      <span className="text-white text-2xl md:text-3xl">
                        {block === "Block 1" &&
                          (earnStore.userSeason0Block1FIN
                            ?.whitelistedFeesUsd === 0
                            ? (0).toFixed(2)
                            : formatOFin(
                                earnStore.userSeason0Block1FIN.whitelistedFeesUsd.toString(),
                                8,
                              ))}
                        {block === "Block 2" &&
                          (earnStore.userSeason0Block2FIN
                            ?.whitelistedFeesUsd === 0
                            ? (0).toFixed(2)
                            : formatOFin(
                                earnStore.userSeason0Block2FIN.whitelistedFeesUsd.toString(),
                                8,
                              ))}
                      </span>
                    )}
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
                  <h1 className="text-grey1 text-sm">
                    Total across all blocks
                  </h1>
                  <span>
                    {earnStore.userSeason0Block1FIN?.whitelistedFeesUsd +
                      earnStore.userSeason0Block2FIN?.whitelistedFeesUsd ===
                    0
                      ? (0).toFixed(2)
                      : formatOFin(
                          String(
                            earnStore.userSeason0Block1FIN.whitelistedFeesUsd +
                              earnStore.userSeason0Block2FIN
                                ?.whitelistedFeesUsd,
                          ),
                          8,
                        )}{" "}
                    oFIN
                  </span>
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
            <div className="uppercase">Rewards Schedule</div>
            <div className="flex flex-col gap-y-1 mt-6 mb-5 px-5">
              <div className="flex items-center mb-2">
                {block === "Block 1" && (
                  <span
                    className={`text-xs w-5 flex items-center justify-center ${
                      new Date() > new Date("2024-02-09")
                        ? "text-white"
                        : "text-grey1"
                    }`}
                  >
                    02/09
                  </span>
                )}
                {block === "Block 2" && (
                  <span
                    className={`text-xs w-5 flex items-center justify-center ${
                      new Date() > new Date("2024-03-15")
                        ? "text-white"
                        : "text-grey1"
                    }`}
                  >
                    03/15
                  </span>
                )}

                <div className="w-full h-[2px]" />
                {block === "Block 1" && (
                  <span
                    className={`text-xs w-5 flex items-center justify-center ${
                      new Date() > new Date("2024-03-15")
                        ? "text-white"
                        : "text-grey1"
                    }`}
                  >
                    03/15
                  </span>
                )}
                {block === "Block 2" && (
                  <span
                    className={`text-xs w-5 flex items-center justify-center ${
                      new Date() > new Date("2024-04-09")
                        ? "text-white"
                        : "text-grey1"
                    }`}
                  >
                    04/09
                  </span>
                )}
                <div className="w-full h-[2px]" />
                <span
                  className={`text-xs w-5 flex items-center justify-center ${
                    new Date() > new Date("2025-00-00")
                      ? "text-white"
                      : "text-grey1"
                  }`}
                >
                  ??/??
                </span>
                <div className="w-full h-[2px]" />
                <span
                  className={`text-xs w-5 flex items-center justify-center ${
                    new Date() > new Date("2025-00-00")
                      ? "text-white"
                      : "text-grey1"
                  }`}
                >
                  ??/??
                </span>
              </div>
              <div className="flex items-center">
                {block === "Block 1" && (
                  <div
                    className={`w-6 h-6 aspect-square ${
                      new Date() > new Date("2024-02-09")
                        ? "bg-main2"
                        : "bg-main"
                    } rounded-full`}
                  />
                )}
                {block === "Block 2" && (
                  <div
                    className={`w-6 h-6 aspect-square ${
                      new Date() > new Date("2024-03-15")
                        ? "bg-main2"
                        : "bg-main"
                    } rounded-full`}
                  />
                )}

                {block === "Block 1" && (
                  <div
                    className={`w-full h-[2px] aspect-square ${
                      new Date() > new Date("2024-03-15")
                        ? "bg-main2"
                        : "bg-main"
                    }`}
                  />
                )}
                {block === "Block 2" && (
                  <div
                    className={`w-full h-[2px] aspect-square ${
                      new Date() > new Date("2024-04-09")
                        ? "bg-main2"
                        : "bg-main"
                    }`}
                  />
                )}

                {block === "Block 1" && (
                  <div
                    className={`w-6 h-6 aspect-square ${
                      new Date() > new Date("2024-03-15")
                        ? "bg-main2"
                        : "bg-main"
                    } rounded-full`}
                  />
                )}
                {block === "Block 2" && (
                  <div
                    className={`w-6 h-6 aspect-square ${
                      new Date() > new Date("2024-04-09")
                        ? "bg-main2"
                        : "bg-main"
                    } rounded-full`}
                  />
                )}

                <div
                  className={`w-full h-[2px] aspect-square ${
                    new Date() > new Date("2025-00-00") ? "bg-main2" : "bg-main"
                  }`}
                />
                <div
                  className={`w-6 h-6 aspect-square ${
                    new Date() > new Date("2025-00-00") ? "bg-main2" : "bg-main"
                  } rounded-full`}
                />
                <div
                  className={`w-full h-[2px] aspect-square ${
                    new Date() > new Date("2025-00-00") ? "bg-main2" : "bg-main"
                  }`}
                />
                <div
                  className={`w-6 h-6 aspect-square ${
                    new Date() > new Date("2025-00-00") ? "bg-main2" : "bg-main"
                  } rounded-full`}
                />
              </div>
              <div className="flex items-center mt-2">
                <span
                  className={`text-xs w-5 flex items-center justify-center ${
                    new Date() > new Date("2024-02-09")
                      ? "text-white"
                      : "text-grey1"
                  }`}
                >
                  START
                </span>
                <div className="w-full h-[2px]" />
                <span
                  className={`text-xs w-5 flex items-center justify-center ${
                    new Date() > new Date("2024-03-15")
                      ? "text-white"
                      : "text-grey1"
                  }`}
                >
                  SNAPSHOT
                </span>
                <div className="w-full h-[2px]" />
                <span
                  className={`text-xs w-5 flex items-center justify-center ${
                    new Date() > new Date("2025-00-00")
                      ? "text-white"
                      : "text-grey1"
                  }`}
                >
                  DROP
                </span>
                <div className="w-full h-[2px]" />
                <span
                  className={`text-xs w-5 flex items-center justify-center ${
                    new Date() > new Date("2025-00-00")
                      ? "text-white"
                      : "text-grey1"
                  }`}
                >
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
