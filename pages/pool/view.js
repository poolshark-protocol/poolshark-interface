import Navbar from "../../components/Navbar";
import {
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon
} from "@heroicons/react/20/solid";

export default function View() {
  
  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-DMSans ">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <div className="mt-[16vh] w-[55rem]">
          <div className="flex justify-between items-center mb-6">
            <div className="text-left flex items-center gap-x-5 py-2.5">
              <div className="flex items-center">
                <img height="50" width="50" src="/static/images/token.png" />
                <img
                  height="50"
                  width="50"
                  className="ml-[-12px]"
                  src="/static/images/token.png"
                />
              </div>
              <span className="text-3xl">DAI-USDC</span>
              <span className="bg-white text-black rounded-md px-3 py-0.5">
                1%
              </span>
              <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                In Range
              </div>
            </div>
            <a href="#">
              <span className="gap-x-2 flex items-center text-white cursor-pointer hover:opacity-80">
                View Pool Stats
                <ArrowTopRightOnSquareIcon className="w-5 " />
              </span>
            </a>
          </div>
          <div className="bg-black  border border-grey2 border-b-none w-full rounded-t-xl py-6 px-7 h-[70vh]">
            <div className="flex gap-x-20 justify-between">
              <div className="w-1/2">
                <h1 className="text-lg mb-3">Unclaimed Fees</h1>
                <span className="text-4xl">$4.50</span>
                <div className="text-grey mt-3 space-y-2">
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img
                        height="30"
                        width="30"
                        src="/static/images/token.png"
                      />
                      DAI
                    </div>
                    <div className="flex items-center gap-x-4">
                      300
                      <span className="bg-grey1 text-grey rounded-md px-3 py-0.5">
                        47%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img
                        height="30"
                        width="30"
                        src="/static/images/token.png"
                      />
                      USDC
                    </div>
                    <div className="flex items-center gap-x-4">
                      303
                      <span className="bg-grey1 text-grey rounded-md px-3 py-0.5">
                        53%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <button className="bg-[#032851] w-full py-3 px-4 rounded-xl">
                    Increase Liquidity
                  </button>
                  <button className="border border-[#032851] w-full py-3 px-4 rounded-xl">
                    Remove Liquidity
                  </button>
                </div>
              </div>
              <div className="w-1/2">
                <h1 className="text-lg mb-3">Liquidity</h1>
                <span className="text-4xl">$603.43</span>
                <div className="text-grey mt-3 space-y-2">
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img
                        height="30"
                        width="30"
                        src="/static/images/token.png"
                      />
                      DAI
                    </div>
                    <span>2.25</span>
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img
                        height="30"
                        width="30"
                        src="/static/images/token.png"
                      />
                      USDC
                    </div>
                    <span>2.25</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <button className="bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80 w-full py-3 px-4 rounded-xl">
                    Collect Fees
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div className="flex mt-7 gap-x-6 items-center">
                <h1 className="text-lg">Price Range </h1>
                <div className="flex items-center rounded-lg gap-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  In Range
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 gap-x-6">
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey text-xs w-full">Min Price.</div>
                <div className="text-white text-2xl my-2 w-full">1.0323</div>
                <div className="text-grey text-xs w-full">DAI per USDC</div>
                <div className="text-grey text-xs w-full italic mt-1">
                  Your position will be 100% DAI at this price.
                </div>
              </div>
              <ArrowsRightLeftIcon className="w-12 text-grey" />
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey text-xs w-full">Max Price.</div>
                <div className="text-white text-2xl my-2 w-full">1.064</div>
                <div className="text-grey text-xs w-full">DAI per USDC</div>
                <div className="text-grey text-xs w-full italic mt-1">
                  Your position will be 100% DAI at this price.
                </div>
              </div>
            </div>
            <div className="border border-grey1 rounded-xl py-2 text-center w-full mt-4 bg-dark">
              <div className="text-grey text-xs w-full">Current Price</div>
              <div className="text-white text-2xl my-2 w-full">1.064</div>
              <div className="text-grey text-xs w-full">DAI per USDC</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
