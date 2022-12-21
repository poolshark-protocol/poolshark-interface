import { useAccount } from 'wagmi'
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { poolsharkHedgePoolABI } from "../abis/evm/poolsharkHedgePool";
import { utils } from 'ethers'
import { ethers } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Navbar() {
  const { isConnected, address } = useAccount();
  console.log('navbar')
  /*const poolAddress = '0xeB13144982b28D059200DB0b4d1ceDe7d96C4FE7'
  const poolInterface = new utils.Interface(poolsharkHedgePoolABI)
  const contract = new Contract(poolAddress, poolInterface)

  console.log(poolAddress)*/
  // const MintComponent = () => {
  //   const poolAddress = '0xeB13144982b28D059200DB0b4d1ceDe7d96C4FE7'
  //   const poolInterface = new utils.Interface(PoolsharkHedgePool)
  //   const contract = new Contract(poolAddress, poolInterface)

  //   const { state, send } = useContractFunction(contract, 'mint', { transactionName: 'Mint' })
  //   console.log('made it')
  //   const { status } = state

  //   const mintFunction = () => {
  //     void send(ethers.utils.parseUnits("0", 0),
  //     ethers.utils.parseUnits("20", 0),
  //     ethers.utils.parseUnits("887272", 0),
  //     ethers.utils.parseUnits("30", 0),
  //     ethers.utils.parseUnits("100"),
  //     false,
  //     false)
  //   }

  //   return (
  //     <div>
  //       <button onClick={() => mintFunction()}>Mint token1</button>
  //       <p>Status: {status}</p>
  //     </div>
  //   )
  // }
  


  const router = useRouter();
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
            <ConnectButton/>
          </div>
        </div>
      </div>
    </div>
  );
}
