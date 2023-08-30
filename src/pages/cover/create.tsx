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

export default function CoverCreate() {
  const { address, isConnected, isDisconnected } = useAccount();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [pool, setPool] = useState(router.query ?? undefined);
  const [shifted, setIsShifted] = useState("initial");
  const [selectedPool, setSelectedPool] = useState(router.query ?? undefined);
  const [state, setState] = useState(router.query.state ?? "initial");
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
    const data = await fetchCoverPositions(address);
    if (data["data"]) {
      const positions = data["data"].positions;
      const positionData = mapUserCoverPositions(positions);
      setAllCoverPositions(positionData);
    }
  }

  const handleDiselectPool = (state) => {
    setState(state);
    setSelectedPool(undefined);
  };
  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className="text-white flex flex-col mx-auto max-w-2xl  justify-center py-10 px-3 md:px-0 pb-32 md:pb-0">
        <h1 className="uppercase">
          Select an option
        </h1>
        <div className="mt-6 rounded-[4px] overflow-hidden border border-grey/70">
          <div className="bg-[url('/static/images/bg/shark2.png')] bg-no-repeat bg-cover w-full flex items-center justify-center">
          <a href="#create">
            <button
              onClick={() => setIsOpen(true)}
              className="px-24 py-6 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition mx-auto my-12 border border-main bg-main1/50 uppercase backdrop-blur shadow-lg text-sm disabled:opacity-50 hover:opacity-80"
            >
              COVER EXISTING POOL
            </button>
            </a>
          </div>
          <div className="bg-[url('/static/images/bg/shark3.png')] bg-no-repeat bg-cover w-full flex items-center justify-center">
            <a href="#create">
            <button
              onClick={() => setIsShifted("createCover")}
              className="px-24 py-6 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition mx-auto my-12 border border-grey bg-black/50 backdrop-blur uppercase shadow-lg text-sm disabled:opacity-50 hover:opacity-80"
            >
              CREATE CUSTOM COVER
            </button>
            </a>
          </div>
        </div>
        <div id="create">
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
        )}
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
