import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState } from "react";

const navigation = [
  { name: "Swap", href: "#", current: true },
  { name: "Pools", href: "#", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}



export default function Navbar() {
  const [wallet, setWallet] = useState(true);
  const [account, setAccount] = useState(null);

  async function connectToFuel() {
    if(wallet) {
      const isConnected = await window.FuelWeb3.connect();
      console.log("Connection response", isConnected);

      const accounts = await window.FuelWeb3.accounts();
      console.log(accounts);
      setAccount(accounts);

     setWallet(false);
    } 
    else if (!wallet){
      await window.FuelWeb3.disconnect();
      setWallet(true);
      setAccount(null);
    } 
  }
  
  return (
    <div className="md:px-10 px-4 pt-3 mx-auto w-full">
      <div className="relative flex items-center justify-between h-16 w-full">
        <div className="grid md:grid-cols-3 grid-cols-2 items-center w-full mx-auto">
          <div className="flex items-center justify-start flex-shrink-0">
            <div className="relative w-40 md:h-40">
              <div className="hidden md:block">
                <Image
                src="/static/images/poolsharkmain.png"
                layout="fill"
                priority={true}
                width={120}
                height={72}
                quality="90"
                objectFit="contain"
              />
              </div>
              <div className="grid grid-cols-3 items-center w-full mx-auto">
                <div className="flex items-center justify-start flex-shrink-0">
                  <div className="relative w-40 h-40">
                    <Image
                      className="hidden w-auto h-8 lg:block"
                      src="/static/images/poolsharkmain.png"
                      layout="fill"
                      priority={true}
                      width={120}
                      height={72}
                      quality="90"
                      objectFit="contain"
                    />
                  </div>
                  <div className="flex text-grey">{account}</div>
                </div>
                <div className="hidden m-auto border flex justify-center border-grey1 rounded-xl p-[2.5px]  sm:ml-auto sm:block bg-black">
                  <div className="flex gap-x-2">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-background text-main transition-all"
                            : "text-grey hover:text-white",
                          " py-2 px-6 rounded-lg text-sm font-medium"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
                <div className=" flex justify-end items-center gap-x-4">
                  <button
                    onClick={() => connectToFuel()}
                    className=" px-10 py-[9px] text-white text-sm transition rounded-lg cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
                  >
                    {wallet ?  "Connect Wallet" : "Disconnect Wallet"}
                  </button>
                  {/* AFTER WALLET IS CONNECTED
            {/* AFTER WALLET IS CONNECTED 
                  <div className="border border-grey1 bg-dark rounded-lg flex items-center h-10 text-white pl-4 mr-3">
                    <img
                      className="w-3.5 mr-2.5"
                      src="/static/images/eth.svg"
                    />
                    2000
                    <span className="text-sm text-grey pl-1.5 mt-[1px] pr-4">
                      ETH
                    </span>
                    <button className="-mr-[1px]  h-10 flex items-center text-white text-sm transition rounded-lg cursor-pointer bg-black border border-grey1 hover:opacity-80">
                      <span className="px-3"> 0x77d7...Eab2</span>
                      <ChevronDownIcon
                        className="w-[38px] border-l-grey1 border-l  h-10 px-[9px]"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  */}
            <button
              type="button"
              className="p-1.5 text-gray-400 bg-black rounded-md border border-[#1E1E1E] hover:text-white outline-none "
            >
              <EllipsisHorizontalIcon className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
