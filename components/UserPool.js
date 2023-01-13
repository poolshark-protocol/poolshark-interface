import {
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/20/solid";
import { Popover } from "@headlessui/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function UserPool({name}) {
const [show, setShow] = useState(false);

  useEffect(() => {
    console.log('component name:', name)
  },[])
  
  
  return (
    <>
    <Link href="/pool/view">
      <div
        onMouseEnter={(e) => {
          setShow(true);
        }}
        onMouseLeave={(e) => {
          setShow(false);
        }}
        className="w-full cursor-pointer flex justify-between items-center bg-dark border border-grey2 rounded-xl py-3.5 pl-5 h-24 relative"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-x-5">
            <div className="flex items-center ">
              <img height="30" width="30" src="/static/images/one.png" />
              <img
                height="30"
                width="30"
                className="ml-[-8px]"
                src="/static/images/zero.png"
              />
            </div>
            {name}
            <div className="bg-black px-2 py-1 rounded-lg text-grey">1%</div>
          </div>
          <div className="text-sm flex items-center gap-x-3">
            <span>
              <span className="text-grey">Min:</span> 1.0323 DAI per USDC
            </span>
            <ArrowsRightLeftIcon className="w-4 text-grey" />
            <span>
              <span className="text-grey">Max:</span> 1.0323 DAI per USDC
            </span>
          </div>
        </div>
        {show ? <div
      className="bg-black rounded-r-xl pt-3 border-l-grey1 border-l absolute right-0"
      >
        <div className="flex gap-x-10 px-4 text-[#646464] mb-2">
        <div>
        <h1 className="text-xs">DAI: <span>0xB8c...Ee62d</span></h1>
        <h1 className="text-xs">USDC: <span>0xB8c...Ee62d</span></h1>
        </div>
       
          <h1 className="text-xs">Pool: <span>0xB8c...Ee62d</span></h1>
        </div>
        
        <div className="bg-dark py-2 text-center rounded-br-xl border-t-grey1 border-t">
          <h1>Unclaimed Rewards: $34.56</h1>
        </div>
      </div> : <div className="pr-5"><div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          In Range
        </div>
        {/* WHEN POSITION IS OUT OF RANGE
      
      <div cl</div>assName="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
        <Excl</div>amationTriangleIcon className="w-4 text-yellow-600"/>
        Out of Range
        </div> */}</div>}
                      
        
      </div>
      </Link>
    </>
  );
}
