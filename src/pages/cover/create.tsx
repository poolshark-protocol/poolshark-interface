import Navbar from "../../components/Navbar";
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import PoolsModal from "../../components/Cover/PoolsModal";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import CreateCover from "../../components/Cover/CreateCover";
import CoverExistingPool from "../../components/Cover/CoverExistingPool";
import { fetchCoverPositions } from "../../utils/queries";
import { mapUserCoverPositions } from "../../utils/maps";
import { useConfigStore } from "../../hooks/useConfigStore";

export default function CoverCreate() {
  const { address, isConnected, isDisconnected } = useAccount();
  const router = useRouter();

  const [
    limitSubgraph,
    coverSubgraph
  ] = useConfigStore((state) => [
    state.limitSubgraph,
    state.coverSubgraph
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [pool, setPool] = useState(router.query ?? undefined);
  const [shifted, setIsShifted] = useState("initial");
  const [selectedPool, setSelectedPool] = useState(router.query ?? undefined);
  const [state, setState] = useState(router.query.state);
  const [allCoverPositions, setAllCoverPositions] = useState([]);

  useEffect(() => {
    if (router.query.state === "nav") {
      setIsShifted("initial");
    }
  }, [router.query]);

  useEffect(() => {
    if (state === "existing" && router.query.state === "nav") {
      setState("initial");
    }
  }, [router.query.state]);

  function setParams(query: any) {
    setIsShifted("coverExistingPool");
    const feeTierPercentage = query.feeTier / 10000;
  }

  async function getUserCoverPositionData() {
    const data = await fetchCoverPositions(coverSubgraph, address);
    if (data["data"]) {
      const positions = data["data"].positions;
      const positionData = mapUserCoverPositions(positions, coverSubgraph);
      setAllCoverPositions(positionData);
    }
  }

  useEffect(() => {
    setState(router.query.state)
  }, [router.query.state]);

  const handleDiselectPool = (state) => {
    setState(state);
    setSelectedPool(undefined);
  };
  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className={`text-white flex flex-col mx-auto max-w-2xl  justify-center py-10 px-3 md:px-0 pb-32 flex-col w-full `}>
        <h1 className="uppercase">
          {state === "existing"
            ? "Create Cover Position"
            : shifted === "createCover"
            ? "Create Custom Cover Position"
            : "Select an Option"}
        </h1>
        {state === "select" ? (
          <div className="mt-6 rounded-[4px] overflow-hidden border border-grey/70">
            <div className="bg-[url('/static/images/bg/shark2.png')] bg-no-repeat bg-cover w-full flex items-center justify-center">
                <button
                  onClick={() => setIsOpen(true)}
                  className="px-24 py-6 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition mx-auto my-12 border border-main bg-main1/50 uppercase backdrop-blur shadow-lg text-sm disabled:opacity-50 hover:opacity-80"
                >
                  COVER A RANGE POSITION
                </button>
            </div>
            <div className="bg-[url('/static/images/bg/shark3.png')] bg-no-repeat bg-cover w-full flex items-center justify-center">
              <a onClick={() => router.push({query: { state: "custom"}})} href="#create">
                <button
                  onClick={() => setIsShifted("createCover")}
                  className="px-24 py-6 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition mx-auto my-12 border border-grey bg-black/50 backdrop-blur uppercase shadow-lg text-sm disabled:opacity-50 hover:opacity-80"
                >
                  CREATE CUSTOM COVER POOL
                </button>
              </a>
            </div>
          </div>
        ):
        <div className="rounded-[4px] flex overflow-hidden w-full mt-6">
                <button
                  onClick={() => setIsOpen(true)}
                  className={`px-10 w-full py-2 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition mx-auto uppercase backdrop-blur shadow-lg text-sm disabled:opacity-50 hover:opacity-80 ${state === "custom" ? "bg-black/50 border-grey border" : "bg-main1/50 border border-main"}`}
                >
                  COVER A RANGE POSITION
                </button>
                <button
                onClick={() => router.push({query: { state: "custom"}})}
                  className={`px-10 w-full py-2 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition mx-auto uppercase backdrop-blur shadow-lg text-sm disabled:opacity-50 hover:opacity-80 ${state === "custom" ? "bg-main1/50 border border-main" : "bg-black/50 border-grey border"}`}
                >
                  CREATE CUSTOM COVER POOL
                </button>
          </div>
        }
        <div id="create">
          {state === "select" && (
            <div className="text-white relative">
              <div className="absolute opacity-50 w-full h-full bg-black top-0 left-0" />
              <CreateCover goBack={setIsShifted} />
            </div>
          )}
          {state === "custom" && (
            <CreateCover query={router.query} goBack={handleDiselectPool} />
          )}
          {state === "range-cover" && (
            <CoverExistingPool goBack={setIsShifted} />
          )}
          {/*}
          {selectedPool != undefined && state == "existing" ? (
            <CreateCover query={router.query} goBack={handleDiselectPool} />
          ) : shifted === "initial" ? (
            <div className="text-white relative">
              <div className="absolute opacity-50 w-full h-full bg-black top-0 left-0" />
              <CreateCover goBack={setIsShifted} />
            </div>
          ) : shifted === "createCover" ? (
            <CreateCover goBack={setIsShifted} />
          ) : (
            <CoverExistingPool goBack={setIsShifted} />
          )}*/}
        </div>
      </div>
      <PoolsModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        prefill={setIsShifted}
        setParams={setParams}
      />
    </div>
  );
}
