import React, { useState, useEffect } from "react";
import { useAccount, useProvider } from "wagmi";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import { fetchCoverPositions } from "../../utils/queries";
import { mapUserCoverPositions } from "../../utils/maps";
import { TickMath } from "../../utils/math/tickMath";
import { useCoverStore } from "../../hooks/useCoverStore";
import Info from "../../components/Icons/InfoIcon";
import SearchIcon from "../../components/Icons/SearchIcon";
import UserIcon from "../../components/Icons/UserIcon";
import UserCoverPool from "../../components/Cover/UserCoverPool";

export default function Cover() {
  const [needsRefetch, setNeedsRefetch] = useCoverStore((state) => [
    state.needsRefetch,
    state.setNeedsRefetch,
  ]);

  const {
    network: { chainId },
  } = useProvider();
  const router = useRouter();
  const { address, isDisconnected } = useAccount();

  const [selectedPool, setSelectedPool] = useState(router.query ?? undefined);
  const [state, setState] = useState(router.query.state ?? "initial");
  const [searchTerm, setSearchTerm] = useState("");
  const [allCoverPositions, setAllCoverPositions] = useState([]);
  const [create, setCreate] = useState(true);

  useEffect(() => {
    if (address) {
      getUserCoverPositionData();
    }
  }, [address]);

  useEffect(() => {
    console.log("refetching");
    if (needsRefetch == true) {
      setTimeout(() => {
        getUserCoverPositionData();
        console.log("refetched");

        setNeedsRefetch(false);
      }, 5000);
    }
  }, [needsRefetch]);

  useEffect(() => {
    if (state === "existing" && router.query.state === "nav") {
      setState("initial");
    }
  }, [router.query.state]);

  async function getUserCoverPositionData() {
    const data = await fetchCoverPositions(address);
    if (data["data"]) {
      const positions = data["data"].positions;
      const positionData = mapUserCoverPositions(positions);
      setAllCoverPositions(positionData);
    }
  }

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDiselectPool = (state) => {
    setState(state);
    setSelectedPool(undefined);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar create={create} setCreate={setCreate} />
      <div className="container mx-auto mt-8">
        <div className="flex gap-x-8 justify-between">
          <div className="p-7 h-[300px] w-[60%] flex flex-col justify-between bg-[url('/static/images/bg/shark.png')]">
            <div className="flex flex-col gap-y-3 ">
              <h1 className="uppercase text-white">
                Cover your liquidity pools
              </h1>
              <p className="text-sm text-white/40 font-light">
                Creave a Cover Pool to mitigate your impermanent loss, take a bullish entry or reduce risk and losses. Its easy and only takes a few minutes
              </p>
            </div>
            <button
              className="px-12 py-3 text-white w-min whitespace-nowrap cursor-pointer text-center transition border border-main bg-main1 uppercase text-sm
                hover:opacity-80"
            >
              CREATE COVER
            </button>
          </div>
          <div className="h-[300px] w-[40%] border border-grey p-7 flex flex-col justify-between">
            <div className="flex flex-col gap-y-3 ">
              <h1 className="uppercase text-white">How it works</h1>
              <p className="text-sm text-grey3 font-light">
                Cover Pools allow you to create positions to increase exposure
                to a specific token conditional on it increasing in price on a
                given pair.
                <br />
                <br />
                <span className="text-xs">
                  - If the ETH price <b>increases</b>, the pool <b>sells DAI</b> and
                  increases the amount of <b>ETH exposure</b>
                  <br />- If the ETH price <b>decreases</b>, the pool <b>
                    sells ETH
                  </b>{" "}
                  and increases the amount of <b>DAI exposure</b>
                </span>
              </p>
            </div>
            <a
              href="https://docs.poolsharks.io/overview/cover-pools/"
              target="_blank"
              rel="noreferrer"
              className="text-grey3 underline text-sm flex items-center gap-x-2 font-light"
            >
              <Info />
              Read More
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-y-4 mt-9">
          <div className="text-grey1 relative">
            <div className="absolute ml-6 mt-2.5">
              <SearchIcon />
            </div>
            <input
              className="w-full bg-dark border-grey border rounded-[4px] uppercase placeholder:text-grey1 text-white text-[13px] py-2 pr-5 pl-12 outline-none"
              placeholder="Search by name, symbol or address"
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
          </div>
          <div className="p-6 bg-dark border border-grey rounded-[4px]">
            <div className="text-white flex items-center text-sm gap-x-3">
              <UserIcon />
              <h1>YOUR POSITIONS</h1>
            </div>
            <div>
              {isDisconnected ? (
                <div className="text-grey1 text-xs  py-10 text-center">
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
                  Your cover positions will appear here.
                </div>
              ) : (
                <>
                  {allCoverPositions.length === 0 ? (
                    <div className="text-grey1 text-xs  py-10 text-center">
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
                      Your cover positions will appear here.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 text-xs text-grey1/60 w-full mt-5 mb-2">
                        <span>Pool Name</span>
                        <span className="text-right">Price Range</span>
                        <span className="text-right">% Filled</span>
                        <span className="text-right mr-4">USD Value</span>
                      </div>
                      {allCoverPositions.map((allCoverPosition) => {
                        if (
                          allCoverPosition.id != undefined &&
                          allCoverPosition.userOwnerAddress ===
                            address?.toLowerCase() &&
                          (allCoverPosition.tokenZero.name.toLowerCase() ===
                            searchTerm.toLowerCase() ||
                            allCoverPosition.tokenOne.name.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPosition.tokenZero.symbol.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPosition.tokenOne.symbol.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPosition.tokenZero.id.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            allCoverPosition.tokenOne.id.toLowerCase() ===
                              searchTerm.toLowerCase() ||
                            searchTerm === "")
                        ) {
                          return (
                            <UserCoverPool
                              key={allCoverPosition.id + "coverPosition"}
                              coverPosition={allCoverPosition}
                              lowerPrice={parseFloat(
                                TickMath.getPriceStringAtTick(
                                  allCoverPosition.lowerTick
                                )
                              )}
                              upperPrice={parseFloat(
                                TickMath.getPriceStringAtTick(
                                  allCoverPosition.upperTick
                                )
                              )}
                              href={"/cover/view"}
                            />
                          );
                        }
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
