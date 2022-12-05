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

const navigation = [
  { name: "Swap", href: "#", current: true },
  { name: "Pools", href: "#", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  return (
    <Disclosure as="nav" className="">
      {({ open }) => (
        <>
          <div className="px-10 pt-3 mx-auto">
            <div className="relative flex items-center justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block w-6 h-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block w-6 h-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
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
                  <div className="flex" onClick={() => disconnectFromFuel()}>
                    Disconnect wallet
                  </div>
                  <button
                    onClick={() => connectToFuel()}
                    className=" px-10 py-[9px] text-white text-sm transition rounded-lg cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
                  >
                    Connect wallet
                  </button>
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
                  <button
                    type="button"
                    className="p-1.5 text-gray-400 bg-black rounded-md border border-[#1E1E1E] hover:text-white outline-none "
                  >
                    <EllipsisHorizontalIcon
                      className="w-6 h-6"
                      aria-hidden="true"
                    />
                  </button>
                  */}

                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block px-3 py-2 rounded-md text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
