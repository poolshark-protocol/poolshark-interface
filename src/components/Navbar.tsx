import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { ConnectWalletButton } from "./Buttons/ConnectWalletButton";
import {useState} from "react";
import Trade from "./Icons/TradeIcon";
import Range from "./Icons/RangeIcon";
import Cover from "./Icons/CoverIcon";

interface NavOptions {
  create?: boolean;
  setCreate?
}

export default function Navbar({create, setCreate}: NavOptions) {
  const router = useRouter()
  const homeHref = 'https://poolshark.fi/'

  return (
    <div className="py-2 mx-auto w-full border-b border-grey">
      <div className="relative flex items-center justify-between h-16 w-full container mx-auto">
        <div className="lg:grid flex justify-between items-center grid-cols-3 w-full mx-auto">
          <div className="flex items-center justify-start flex-shrink-0">
                <Image
                  src="/static/images/logo.png"
                  width={70}
                  height={70}
                  quality="90"
                  objectFit="contain"
                />
          </div>
          <div className="hidden m-auto flex justify-start md:block bg-black">
            <div className="flex gap-x-2">
              <Link href="/">
                <div
                  className={
                    router.pathname == '/'
                      ? 'bg-main1 border border-main text-main2 transition-all py-1.5 px-5 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]'
                      : 'text-grey1 border border-transparent transition-all py-1.5 px-5 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]'
                  }
                >
                  <Trade/>
                  TRADE
                </div>
              </Link>
              <Link href="/pool">
                <div
                  className={
                    router.pathname == '/range'
                      ? 'bg-main1 border border-main text-main2 transition-all py-1.5 px-5 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]'
                      : 'text-grey1 border border-transparent transition-all py-1.5 px-5 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]'
                  }
                >
                  <Range/>
                  RANGE
                </div>
              </Link>
              <Link
                href={{
                  pathname: '/cover',
                  query: {
                    state: 'nav',
                  },
                }}
              >
                <div
                  className={
                    router.pathname == '/cover'
                      ? 'bg-main1 border border-main text-main2 transition-all py-1.5 px-5 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]'
                      : 'text-grey1 border border-transparent transition-all py-1.5 px-5 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]'
                  }
                >
                  <Cover/>
                  COVER
                </div>
              </Link>
            </div>
          </div>
          
          <div className=" flex justify-end items-center gap-x-4">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full md:hidden z-50 px-3 md:px-0">
        <div>
                            <div className={
                    router.pathname == "/cover"
                      ? "m-auto border flex w-full justify-center border-grey1 rounded-t-xl p-[10px] pb-[15px] -mb-[5px] bg-black"
                      : "hidden"}>
            <div className="flex gap-x-2">
                <div
                onClick={() => setCreate(true)}
                  className={
                    create
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm  cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm  cursor-pointer"
                  }
                >
                  Create Cover
                </div>
                <div
                 onClick={() => setCreate(false)}
                  className={
                    create === false
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm  cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm  cursor-pointer"
                  }
                >
                  My positions
                </div>
            </div>
          </div>
          
        </div>
                  <div className="m-auto border flex w-full justify-center border-grey1 rounded-t-xl p-[10px] bg-black">
            <div className="flex gap-x-2">
              <Link href="/">
                <div
                  className={
                    router.pathname == "/"
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm  cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm  cursor-pointer"
                  }
                >
                  Swap
                </div>
              </Link>
              <Link href="/pool">
                <div
                  className={
                    router.pathname == "/pool"
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm  cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm  cursor-pointer"
                  }
                >
                  Pool
                </div>
              </Link>
              <Link href="/cover">
                <div
                  className={
                    router.pathname == "/cover"
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm  cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm  cursor-pointer"
                  }
                >
                  Cover
                </div>
              </Link>
            </div>
          </div>
      </div>
    </div>
  )
}
