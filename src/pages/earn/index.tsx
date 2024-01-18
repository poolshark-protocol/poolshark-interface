import Navbar from "../../components/Navbar";
import InfoIcon from "../../components/Icons/InfoIcon";
import { useState } from "react";
import Image from "next/image";
import useInputBox from "../../hooks/useInputBox";
import StakeFinButton from "../../components/Buttons/StakeFinButton";
import UnstakeFinButton from "../../components/Buttons/UnstakeFinButton";
import CompoundOFinButton from "../../components/Buttons/CompoundOFinButton";

export default function Earn() {
  const [stakingTab, setStakingTab] = useState("stake");

  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className="pt-10 pb-32 md:pb-0 text-white relative min-h-[calc(100vh-76px)] container mx-auto md:px-0 px-3">
        <div className="flex lg:flex-row flex-col gap-10">
          <div className="border border-grey rounded-[4px] w-full">
            <div className=" p-6">
              <h1 className="text-lg uppercase">$FIN Staking</h1>
              <p className="text-sm text-grey3 font-light mt-4 mb-10">
                Lorem ipsum dolor sit amet consectetur adipiscing elit nascetur
                purus, habitant mattis cum eros senectus fusce suscipit tempor,
                arcu cubilia porttitor odio natoque fringilla eget in.
                <br />
                <br />
                Dictumst fermentum morbi mollis aliquam nostra vehicula nulla
                leo ridiculus, habitant taciti phasellus primis mi auctor ac.
                habitant taciti phasellus primis mi auctor ac.
              </p>
              <a
                href="https://docs.poolsharks.io/overview/range-pools/"
                target="_blank"
                rel="noreferrer"
                className="text-grey3 underline text-sm flex items-center gap-x-2 font-light"
              >
                <InfoIcon />
                Read More
              </a>
            </div>
          </div>
          <div className="bg-dark font-regular border border-grey rounded-[4px] w-full ">
            <div className="flex text-xs">
              <button
                onClick={() => setStakingTab("stake")}
                className={`w-full relative py-2.5 ${
                  stakingTab === "stake"
                    ? "text-white"
                    : "text-white/50 border-b border-r border-grey"
                }`}
              >
                {stakingTab === "stake" && (
                  <div className="h-0.5 w-full bg-main absolute top-[-1px]" />
                )}
                STAKE
              </button>
              <button
                onClick={() => setStakingTab("unstake")}
                className={`w-full relative py-2.5 ${
                  stakingTab === "unstake"
                    ? "text-white"
                    : "text-white/50 border-b border-l border-grey"
                }`}
              >
                {stakingTab === "unstake" && (
                  <div className="h-0.5 w-full bg-main absolute top-[-1px]" />
                )}
                UNSTAKE
              </button>
            </div>
            {stakingTab === "stake" ? 
            <div className="p-5 flex flex-col gap-y-9">
            <div className="border border-grey bg-black rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
              <div className="flex items-end justify-between text-[11px] text-grey1">
                <span>~$500</span>
                <span>BALANCE: 200</span>
              </div>
              <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                <div></div>
                <div className="flex items-center gap-x-2 ">
                  <button className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border md:block hidden">
                    MAX
                  </button>
                  <div className="flex items-center gap-x-2 bg-dark border border-grey rounded-[4px] px-3 pr-12 text-xs h-10">
                    <Image
                      width={22}
                      height={22}
                      src="/static/images/fin_icon.png"
                    />
                    FIN
                  </div>
                </div>
              </div>
            </div>
            <StakeFinButton />
          </div>
          : <div className="p-5 flex flex-col gap-y-9">
          <div className="border border-grey bg-black rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
            <div className="flex items-end justify-between text-[11px] text-grey1">
              <span>~$500</span>
              <span>STAKED: 200</span>
            </div>
            <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
              <div></div>
              <div className="flex items-center gap-x-2 ">
                <button className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border md:block hidden">
                  MAX
                </button>
                <div className="flex items-center gap-x-2 bg-dark border border-grey rounded-[4px] px-3 pr-12 text-xs h-10">
                  <Image
                    width={22}
                    height={22}
                    src="/static/images/fin_icon.png"
                  />
                  FIN
                </div>
              </div>
            </div>
          </div>
          <UnstakeFinButton />
        </div>
            }
            
          </div>
        </div>
        <div className="flex flex lg:flex-row flex-col items-start gap-10 mt-6">
          <div className="border border-grey rounded-[4px] p-6 w-full">
            <h1 className="text-lg uppercase">STATISTICS</h1>
            <div className="flex items-center gap-x-5 mt-3 w-full">
              <div className="border border-main rounded-[4px] flex flex-col w-full items-center justify-center gap-y-4 h-32 bg-main1 ">
                <span className="text-main2/60 text-[13px]">FIN PRICE</span>
                <span className="text-main2 lg:text-4xl text-3xl">$20</span>
              </div>
              <div className=" rounded-[4px] flex flex-col w-full bg-[#2ECC71]/10 items-center justify-center gap-y-4 h-32">
                <span className="text-[#2ECC71]/50 text-[13px]">APR</span>
                <span className="text-[#2ECC71] text-2xl md:text-4xl">
                  8.35%
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mt-6">
                <h1 className="text-lg uppercase">FIN DISTRIBUTION</h1>
                <span className="uppercase">
                  43.54% <span className="text-grey1">Staked</span>
                </span>
              </div>
              <div className="border-l border-b border-grey gap-y-4 flex flex-col w-full mt-4 pb-3">
                <div className="h-9 flex items-center justify-between rounded-r-full w-[30%] px-3 border-l-0 bg-main2/40 border border-main2">
                  <div className="">
                  <span className=" text-xs hidden md:block text-[#8FC0FF]">STAKED</span>
                  </div>
                  <span className=" text-xs text-[#8FC0FF]">386,698</span>
                </div>
                <div className="h-9 flex items-center justify-between rounded-r-full w-[60%] px-3 border-l-0 bg-[#002C85]/40 border border-[#002C85]">
                  <div>
                  <span className=" text-xs text-[#3371EF]">
                    CIRCULATING
                  </span>
                  </div>
                  <span className=" text-xs text-[#3371EF]">386,698</span>
                </div>
                <div className="h-9 flex items-center justify-between rounded-r-full w-[100%] px-3 border-l-0 bg-[#2A2A2A] border border-[#717171]">
                  <span className=" text-xs text-[#D9D9D9]">TOTAL </span>
                  <span className=" text-xs text-[#D9D9D9]">1,000,000</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border border-grey rounded-[4px] p-6 w-full bg-dark">
            <h1 className="text-lg uppercase">MY POSITION</h1>
            <div className="flex flex-col gap-y-6">
            <div className="border border-grey bg-black mt-3 rounded-[4px] flex flex-col w-full items-center justify-center gap-y-4 h-32">
              <span className="text-grey1 text-[13px]">AMOUNT STAKED</span>
              <span className="text-white text-center xl:text-4xl md:text-3xl text-2xl">
                442.54 FIN
              </span>
            </div>
            <div className="bg-[#0E315F]/50 border border-[#75A0D7]/40 flex justify-between text-sm text-[#8FC0FF] p-4 rounded-[4px]">
                <span>
                    REWARDS EARNED
                </span>
                <span>60 oFIN</span>
            </div>
            <CompoundOFinButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
