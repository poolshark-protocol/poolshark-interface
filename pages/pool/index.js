import Navbar from "../../components/Navbar";
import {
  PlusSmallIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import UserPool from "../../components/UserPool";
import PoolList from "../../components/AllPools";
import Link from "next/link";

export default function Pool() {
  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-DMSans">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <div className="mt-[16vh] w-[55rem]">
          <div className="flex justify-between mb-6 items-end">
            <h1 className="text-3xl">Pools</h1>
            <Link href="/pool/create">
              <button className="flex items-center gap-x-1.5 px-7 py-[9px] text-white text-sm transition whitespace-nowrap rounded-lg cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80">
                <PlusSmallIcon className="w-6" />
                Create Pool
              </button>
            </Link>
          </div>
          <div className="bg-black border border-grey2 w-full rounded-t-xl p-6 space-y-4 h-[44rem] overflow-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 text-grey absolute ml-[14px] mt-[13px]" />
              <input
                className="border border-grey2 bg-dark rounded-xl py-2.5 w-full placeholder:text-grey outline-none pl-12"
                placeholder="Search name, symbol or address"
              />
            </div>
            <div className="">
              <h1 className="mb-3">My Pools</h1>
              <div className="space-y-2">
                <UserPool />
                <UserPool />
              </div>
            </div>
            <div className="">
              <h1 className="mb-3">All Pools</h1>
              <div className="space-y-2">
                <PoolList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
