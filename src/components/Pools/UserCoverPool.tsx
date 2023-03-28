import {
  ArrowsRightLeftIcon,
  ArrowLongRightIcon
} from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { useStore } from "../../hooks/useStore";





export default function UserCoverPool({ 
  tokenOneName, 
  tokenZeroName, 
  coverTokenOne, 
  coverTokenZero, 
  poolAddress,
  prefill,
  close
}) {
const [show, setShow] = useState(false);
const [tokenZeroDisplay, setTokenZeroDisplay] = useState(
                                                coverTokenZero?.substring(0, 6) 
                                              + "..."  
                                              + coverTokenZero?.substring(
                                                  coverTokenZero?.length-4, 
                                                  coverTokenZero?.length
                                              ));
const [tokenOneDisplay, setTokenOneDisplay]  = useState(
                                                coverTokenOne?.substring(0, 6) 
                                              + "..."  
                                              + coverTokenOne?.substring(
                                                  coverTokenOne?.length-4, 
                                                  coverTokenOne?.length
                                              ));
const [poolDisplay, setPoolDisplay] = useState(
                                                poolAddress?.substring(0, 6) 
                                              + "..."  
                                              + poolAddress?.substring(
                                                poolAddress?.length-4, 
                                                poolAddress?.length
                                              ));

        

                                              
const [currentPool,resetPool, updatePool] = useStore((state) => [state.pool,state.resetPool, state.updatePool])

const setPool = () => {
  resetPool;
  updatePool({
    tokenOneName:tokenOneName, 
    tokenZeroName: tokenZeroName, 
    coverTokenOne:coverTokenOne, 
    coverTokenZero: coverTokenZero, 
    poolAddress: poolAddress
  })
  prefill("existingPool");
  close(false)
  // console.log(currentPool)

}


// useEffect(() => {
//   console.log(
//   tokenOneName, 
//  tokenZeroName, 
//   coverTokenOne, 
//   coverTokenZero, 
//   poolAddress,)
// },[])
  return (
    <>
    
      <div
      onClick={() =>  setPool()}
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
              <img height="30" width="30"  src="/static/images/dai_icon.png" />
              <img
                height="30"
                width="30"
                className="ml-[-8px]"
                src="/static/images/token.png"
              />
            </div>
            <div className="flex gap-x-2">
              {tokenOneName}<ArrowLongRightIcon className="w-5"/>{tokenZeroName}
            </div>
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
        </div> <div className="pr-5"><div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          In Range
        </div>
        {/* WHEN POSITION IS OUT OF RANGE
      
      <div cl</div>assName="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
        <Excl</div>amationTriangleIcon className="w-4 text-yellow-600"/>
        Out of Range
        </div> */}</div>
                      
        
      </div>
 
    </>
  );
}
