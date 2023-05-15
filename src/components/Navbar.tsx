import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { ConnectWalletButton } from "./Buttons/ConnectWalletButton";
import {useState} from "react";

export default function Navbar({create, setCreate}) {

  const router = useRouter();
  const homeHref = 'http://localhost:3000/'; 
  
  return (
    <div className="md:px-10 px-4 pt-3 mx-auto w-full">
      <div className="relative flex items-center justify-between h-16 w-full">
        <div className="grid md:grid-cols-3 grid-cols-2 items-center w-full mx-auto">
          <div className="flex items-center justify-start flex-shrink-0">
            <div className="relative w-40 md:h-40">
              <div className="hidden md:block">
                <a href={homeHref}>
                <Image
                  src="/static/images/poolsharkmain.png"
                  className="cursor-pointer"
                  layout="fill"
                  priority={true}
                  quality="90"
                  objectFit="contain"
                />
              </a> 
              </div>
              <div className="block md:hidden">
                <Image
                  src="/static/images/logo.png"
                  width={60}
                  height={50}
                  quality="90"
                  objectFit="contain"
                />
              </div>
            </div>
          </div>
          <div className="hidden m-auto border flex justify-center border-grey1 rounded-xl p-[2.5px] md:block bg-black">
            <div className="flex gap-x-2">
              <Link href="/">
                <div
                  className={
                    router.pathname == "/"
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                  }
                >
                  Swap
                </div>
              </Link>
              <Link href="/pool">
                <div
                  className={
                    router.pathname == "/pool"
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                  }
                >
                  Pool
                </div>
              </Link>
              <Link href="/cover">
                <div
                  className={
                    router.pathname == "/cover"
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                  }
                >
                  Cover
                </div>
              </Link>
            </div>
          </div>
          <div className=" flex justify-end items-center gap-x-4">
            <ConnectWalletButton/>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full md:hidden z-50">
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
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                  }
                >
                  Create Cover
                </div>
                <div
                 onClick={() => setCreate(false)}
                  className={
                    create === false
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
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
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                  }
                >
                  Swap
                </div>
              </Link>
              <Link href="/pool">
                <div
                  className={
                    router.pathname == "/pool"
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                  }
                >
                  Pool
                </div>
              </Link>
              <Link href="/cover">
                <div
                  className={
                    router.pathname == "/cover"
                      ? "bg-background text-main transition-all py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                      : "text-grey hover:text-white py-2 px-6 rounded-lg text-sm font-medium cursor-pointer"
                  }
                >
                  Cover
                </div>
              </Link>
            </div>
          </div>
      </div>
    </div>
  );
}
