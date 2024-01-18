import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { ConnectWalletButton } from "./Buttons/ConnectWalletButton";
import { useEffect, useState } from "react";
import Trade from "./Icons/TradeIcon";
import Range from "./Icons/RangeIcon";
import Cover from "./Icons/CoverIcon";
import { useConfigStore } from "../hooks/useConfigStore";
import Earn from "./Icons/Earn";

interface NavOptions {
  create?: boolean;
  setCreate?;
}

export default function Navbar({ create, setCreate }: NavOptions) {
  const router = useRouter();

  const [chainId] = useConfigStore((state) => [state.chainId]);

  return (
    <div className="py-2 mx-auto w-full border-b border-grey">
      <div className="relative flex items-center justify-between h-16 w-full container mx-auto md:px-0 px-3">
        <div className="xl:grid flex justify-between items-center grid-cols-3 w-full mx-auto">
          <div className="flex items-center justify-start flex-shrink-0">
            <Link href="/">
              <div className="flex items-center">
                <Image
                  src="/static/images/logo.png"
                  width={70}
                  height={70}
                  quality="90"
                  objectFit="contain"
                  alt="Poolshark logo"
                />
              </div>
            </Link>
          </div>
          <div className="hidden w-full ml-2 lg:ml-4 xl:ml-0 flex justify-start md:block bg-black">
            <div className="flex md:gap-x-1 gap-x-2 justify-center">
              <Link href="/">
                <div
                  className={
                    router.pathname == "/" || router.pathname.includes("/limit")
                      ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-5 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]"
                      : "text-grey1 border border-transparent transition-all py-1.5 px-5 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]"
                  }
                >
                  <Trade />
                  TRADE
                </div>
              </Link>
              <Link href="/range">
                <div
                  className={
                    router.pathname.includes("/range")
                      ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]"
                      : "text-grey1 border border-transparent transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]"
                  }
                >
                  <Range />
                  RANGE
                </div>
              </Link>
              {/* <Link href="/cover"> 
              <div
                className={
                  router.pathname.includes("/cover")
                    ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]"
                    : "text-grey1 border border-transparent transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]"
                }
              >
                <Cover />
                COVER
              </div>
               </Link> */}
              {chainId === 42161 ? (
                <Link href="/bond">
                  <div
                    className={
                      router.pathname.includes("/bond")
                        ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]"
                        : "text-grey1 border border-transparent transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]"
                    }
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 16 16"
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                      <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"></path>
                    </svg>
                    BOND
                  </div>
                </Link>
              ) : (
                <></>
              )}
              <Link href="/earn">
                <div
                  className={
                    router.pathname.includes("/earn")
                      ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]"
                      : "text-grey1 border border-transparent transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]"
                  }
                >
                  <Earn />
                  EARN
                </div>
              </Link>
            </div>
          </div>
          <div className="w-full flex justify-end items-center gap-x-4">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full md:hidden z-50 ">
        <div className="m-auto border-t flex w-full justify-center border-grey shadow-lg p-[10px] bg-black">
          <div className="flex">
            <Link href="/">
              <div
                className={
                  router.pathname == "/"
                    ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-0.5 text-[11px]"
                    : "text-grey1 border border-transparent transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-0.5 text-[11px]"
                }
              >
                <Trade />
                TRADE
              </div>
            </Link>
            <Link href="/range">
              <div
                className={
                  router.pathname.includes("/range")
                    ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-0.5 text-[11px]"
                    : "text-grey1 border border-transparent transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-0.5 text-[11px]"
                }
              >
                <Range />
                RANGE
              </div>
            </Link>
            {/* <Link href="/cover">
            <div
              className={
                router.pathname.includes("/cover")
                  ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-1 text-[11px]"
                  : "text-grey1 border border-transparent transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-1 text-[11px]"
              }
            >
              <Cover />
              COVER
            </div>
            </Link> */}
            {chainId === 42161 ? (
              <Link href="/bond">
                <div
                  className={
                    router.pathname.includes("/bond")
                      ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-1 text-[11px]"
                      : "text-grey1 border border-transparent transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-1 text-[11px]"
                  }
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 16 16"
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                    <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"></path>
                  </svg>
                  BOND
                </div>
              </Link>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
