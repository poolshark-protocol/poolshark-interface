import {
  ArrowsRightLeftIcon,
  ArrowLongRightIcon
} from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function UserPool({ 
  tokenOneName, 
  tokenZeroName, 
  tokenOneAddress, 
  tokenZeroAddress, 
  poolAddress}) {
const [show, setShow] = useState(false);
const [tokenZeroDisplay, setTokenZeroDisplay] = useState(
                                                tokenZeroAddress?.substring(0, 6) 
                                              + "..."  
                                              + tokenZeroAddress?.substring(
                                                  tokenZeroAddress?.length-4, 
                                                  tokenZeroAddress?.length
                                              ));
const [tokenOneDisplay, setTokenOneDisplay]  = useState(
                                                tokenOneAddress?.substring(0, 6) 
                                              + "..."  
                                              + tokenOneAddress?.substring(
                                                  tokenOneAddress?.length-4, 
                                                  tokenOneAddress?.length
                                              ));
const [poolDisplay, setPoolDisplay] = useState(
                                                poolAddress?.substring(0, 6) 
                                              + "..."  
                                              + poolAddress?.substring(
                                                poolAddress?.length-4, 
                                                poolAddress?.length
                                              ));

useEffect
  return (
    <>
    <Link href="/pool/view">
      <div
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
            <div className="flex gap-x-2">
              {tokenOneName}<ArrowLongRightIcon className="w-5"/>{tokenZeroName}
            </div>
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
      className="bg-black pt-1 absolute w-full h-full left-0 rounded-xl"
      >
        <div className="flex gap-x-10 px-4 text-[#646464] my-2">
        <div>
        <h1 className="text-xs">{tokenOneName} <span>{tokenOneDisplay}</span></h1>
        <h1 className="text-xs mt-2">{tokenZeroName} <span>{tokenZeroDisplay}</span></h1>
        </div>
       
          <h1 className="text-xs">Pool: <span>{poolDisplay}</span></h1>
        </div>
        
        <div className="bg-dark text-sm py-1 text-center rounded-br-xl border-t-grey1 border-t mt-3 rounded-b-xl">
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
