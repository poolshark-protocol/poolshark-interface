import ConcentratedPool from "../../components/Pools/ConcentratedPool";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { ArrowLongLeftIcon } from "@heroicons/react/20/solid";

export default function Concentrated() {
  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen  ">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <div className="max-w-[60rem] w-full mx-4 md:mx-0 mt-[10vh] mb-[10vh]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-x-6">
              <h1 className="text-3xl">Create Range Position</h1>
            </div>
            <Link href="/pool">
              <div className="bg-black border border-grey2 rounded-lg text-white px-7 py-[9px] cursor-pointer hover:opacity-80 flex gap-x-3">
                <ArrowLongLeftIcon className="w-4 opacity-50 " />
                <h1 className="opacity-50 md:text-base text-sm">Back</h1>
              </div>
            </Link>
          </div>
          <ConcentratedPool />
        </div>
      </div>
    </div>
  );
}
