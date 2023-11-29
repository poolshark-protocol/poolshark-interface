import Navbar from "../../components/Navbar";
import Info from "../../components/Icons/InfoIcon";
import ClaimRewardsButton from "../../components/Buttons/ClaimRewardsButton";
import { CheckIcon } from "@heroicons/react/20/solid";

export default function Incentives() {
  return (
    <div className=" bg-no-repeat bg-black min-h-screen ">
      <Navbar />
      <div className="flex justify-center w-full text-white container mx-auto">
        <div className=" mt-8">
        <div className="lg:h-[300px] h-full w-full border border-grey p-7 flex flex-col justify-between">
            <div className="flex flex-col gap-y-3 ">
              <h1 className="uppercase text-white">How Incentives work</h1>
              <p className="text-sm text-grey3 font-light">
                Lorem ipsum dolor sit amet consectetur adipiscing elit venenatis
                sollicitudin, magnis tempor maecenas aliquet tincidunt faucibus
                turpis imperdiet at praesent, sagittis class id nostra facilisi
                auctor eu mi. Ligula sapien a egestas ac mus blandit dignissim
                neque lacinia phasellus, <br /> <br />
                venenatis tincidunt aliquet aliquam justo mauris dui nisl
                vulputate. Ac a consequat venenatis arcu rhoncus condimentum
                pulvinar eu cras tristique mollis, quis aenean natoque urna
                commodo nullam fermentum at conubia gravida
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
          <div className="w-full mb-5">
            <div className="flex h-full gap-x-5  mt-5">
              <div className="bg-dark border border-grey p-5 w-full">
                <h1>oFIN EARNED</h1>
                <div className="flex gap-x-5 mt-5">
                  <div className="border border-grey w-full rounded-[4px] bg-black flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs uppercase">
                      Trading Rewards
                    </span>
                    <span className="text-white text-2xl md:text-3xl">
                      20.533
                    </span>
                  </div>

                  <div className="border border-grey w-full rounded-[4px] bg-black flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs uppercase">
                      LP Rewards
                    </span>
                    <span className="text-white text-2xl md:text-3xl">
                      20.533
                    </span>
                  </div>
                  <div className="border border-grey w-full rounded-[4px] bg-black flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs uppercase">
                      FIN Staking Rewards
                    </span>
                    <span className="text-white text-2xl md:text-3xl">
                      20.533
                    </span>
                  </div>
                  <div className="border border-main w-full rounded-[4px] bg-main1 flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-white/20 text-xs uppercase">
                      Total Rewards
                    </span>
                    <span className="text-main2 text-2xl md:text-3xl">
                      175.93
                    </span>
                  </div>
                </div>
              </div>
              <div className="border h-full bg-dark border-grey rounded-[4px] lg:w-1/2 w-full p-5">
                <div className="flex justify-between">
                  <h1 className="uppercase text-white">
                    Rewards Available to Claim
                  </h1>
                </div>

                <div className="flex flex-col gap-y-3 mt-2">
                  <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                    <div className="flex items-end justify-between text-[11px] text-grey1">
                      <span>~$ 500</span>
                    </div>
                    <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                      175.93
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
