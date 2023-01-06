import {
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/20/solid";

export default function UserPool({name}) {
  
  return (
    <div className="w-full flex justify-between items-center bg-dark border border-grey2 rounded-xl py-3.5 px-5">
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
      <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        In Range
      </div>
      {/* WHEN POSITION IS OUT OF RANGE
      
      <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
        <ExclamationTriangleIcon className="w-4 text-yellow-600"/>
        Out of Range
        </div> */}
    </div>
  );
}
