import { AdjustmentsHorizontalIcon, ArrowSmallDownIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import Head from "next/head";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex items-center w-full h-screen text-white ">
      <div className="flex flex-col w-full m-4 max-w-md p-6 mx-auto bg-black border border-[#313131] rounded-lg">
        <div className="flex items-center">
        <div className="flex gap-4 ">
          <div className="flex">Swap</div>
            <div className="flex text-gray-500">Limit</div>
        </div>
        <div className="ml-auto">
            <AdjustmentsHorizontalIcon className="w-5 h-5"/>
        </div>
        </div>
        <div className="px-4 py-2 ml-auto transition cursor-pointer hover:opacity-80"></div>
        <div className="w-full align-middle items-center sm:flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4  p-4 rounded-xl ">
          <span class="absolute flex items-center pl-5 mr-5"></span>
          <input
            className="w-full sm:w-2/3 bg-[#0C0C0C] text-white mb-2 sm:mb-0 p-4 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
            placeholder="300"
          />

          <input
            className="w-full rounded-xl drop-shadow-lg mb-2 sm:mb-0 p-4 sm:w-1/3 bg-[#0C0C0C]"
            placeholder="123"
          />
        </div>
        <div className="items-center -mt-1 p-2 m-auto border border-[#1E1E1E] z-50 bg-black rounded cursor-pointer">
         <ArrowSmallDownIcon className="w-4 h-4"/>
        </div>

        <div className="w-full align-middle items-center sm:flex -mt-1 bg-[#0C0C0C] border border-[#1C1C1C] gap-4  p-4 rounded-xl ">
          <span class="absolute flex items-center pl-5 mr-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
              />
            </svg>
          </span>
          <input
            className="w-full sm:w-1/3 mb-2 sm:mb-0 pl-12 bg-[#0C0C0C] p-4 rounded-xl"
            placeholder="FTM"
          />

          <input
            className="w-full drop-shadow-lg rounded-xl mb-2 sm:mb-0 p-4 sm:w-1/3 bg-[#0C0C0C]"
            placeholder="test"
          />
          <input
            className="w-full drop-shadow-lg rounded-xl mb-2 sm:mb-0 p-4 text-center sm:w-1/3 bg-[#0C0C0C]"
            placeholder="test"
          />
        </div>
        <div className="px-16 w-full py-5 mx-auto mt-4 text-xs font-bold text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80">
          Swap
        </div>
      </div>
    </div>
  );
}
