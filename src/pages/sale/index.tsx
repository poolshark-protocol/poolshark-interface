import Navbar from "../../components/Navbar";
import ExternalLinkIcon from "../../components/Icons/ExternalLinkIcon";
import { useEffect, useState } from "react";
import { useConfigStore } from "../../hooks/useConfigStore";
import Link from "next/link";
import { chainProperties, supportedNetworkNames } from "../../utils/chains";

export default function Bond() {
  const [priceFill, setPriceFill] = useState("50%");
  const [price, setPrice] = useState("3.12%");

  const [chainId, networkName, logoMap, limitSubgraph, setLimitSubgraph] =
    useConfigStore((state) => [
      state.chainId,
      state.networkName,
      state.logoMap,
      state.limitSubgraph,
      state.setLimitSubgraph,
    ]);
  const [marketData, setMarketData] = useState([]);
  const [bondProtocolConfig, setBondProtocolConfig] = useState({});

  useEffect(() => {
    setBondProtocolConfig(
      chainProperties[networkName]?.bondProtocol ??
        chainProperties["arbitrum-one"]?.bondProtocol
    );
  }, [networkName]);

  const [tellerDisplay, setPoolDisplay] = useState(
    bondProtocolConfig && bondProtocolConfig["tellerAddress"]
      ? bondProtocolConfig["tellerAddress"].toString().substring(0, 6) +
          "..." +
          bondProtocolConfig["tellerAddress"]
            .toString()
            .substring(
              bondProtocolConfig["tellerAddress"].toString().length - 4,
              bondProtocolConfig["tellerAddress"].toString().length
            )
      : undefined
  );




  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className="flex flex-col pt-10 pb-32 md:pb-0 text-white relative min-h-[calc(100vh-76px)] container mx-auto md:px-0 px-3">
        <div className="flex md:flex-row flex-col justify-between w-full items-start md:items-center gap-y-5">
          <div className="flex items-center gap-x-4">
            <div className="">
              <img height="70" width="70" src="/static/images/fin_icon.png" />
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="flex text-lg items-center text-white">
                <h1>
                  $
                  {marketData[0] != undefined
                    ? marketData[0]?.payoutTokenSymbol
                    : "FIN"}{" "}
                  SALE
                </h1>
                <a
                  href={
                    `${chainProperties[networkName]["explorerUrl"]}/address/` +
                    bondProtocolConfig["tellerAddress"]
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-x-3 text-grey1 group cursor-pointer"
                >
                  <span className="-mb-1 text-light text-xs ml-8 group-hover:underline">
                    {tellerDisplay}
                  </span>{" "}
                  <ExternalLinkIcon />
                </a>
              </div>
              <div className="flex text-xs text-[#999999] items-center gap-x-3">
                STATUS:{" "}
                <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                  100% FILLED
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-x-4 w-full md:w-auto">
            <Link href={'/?chain=34443&from=0x4200000000000000000000000000000000000006&to=0xf0F161fDA2712DB8b566946122a5af183995e2eD'}>
            <button
              className="bg-main1 hover:opacity-80 transition-all border whitespace-nowrap w-full rounded-full text-center border-main transition-all py-2.5 px-20 text-sm uppercase cursor-pointer text-[13px] text-main2"
            >
              BUY FIN
            </button>
            </Link>
          </div>
        </div>
        <div className=" w-full mt-8 gap-10">
          <div className="border h-min border-grey rounded-[4px] w-full p-5 pb-7">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">STATISTICS</h1>
            </div>
            <div className="flex flex-row gap-6 mt-2">
              <div className="border w-full border-main rounded-[4px] flex flex-col w-full items-center justify-center gap-y-4 h-32 bg-main1 ">
                <span className="text-main2/60 text-[13px]">
                  CURRENT SALE PRICE
                </span>
                <span className="text-main2 lg:text-4xl text-3xl">
                  ${price}
                </span>
              </div>
              <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-4 h-32">
                <span className="text-grey1 text-[13px]">TOTAL VALUE SOLD</span>
                <span className="text-white text-center xl:text-4xl md:text-3xl text-2xl">
                  $353,452.53
                 <span className="text-grey2"> / $353,452.53</span>
                </span>
              </div>
            </div>
          </div>
          <div className="mt-10 relative bg-dark border border-grey h-[350px] flex items-end">
            <div className="bg-black border-grey border px-5 py-2 rounded-[4px] absolute text-xs bottom-16 left-5">
              <span className="text-white/70">Start Price:</span> $2
            </div>
            <div className="bg-black border-grey border px-5 py-2 rounded-[4px] absolute text-xs top-4 right-5">
            <span className="text-white/70">End Price:</span> $4
            </div>
          <div className="svg-container bottom-0" style={{ position: 'relative', width: '100%', height: '300px' }}>
  <div className="absolute w-full h-full bottom-0 left-0 p-5">
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1432 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1431.17 0.196533C969.361 213.838 13.2114 259.935 0.178223 259.935H1431.17V0.196533Z"
        fill="#27282D"
        fill-opacity="0.4"
      />
    </svg>
  </div>
  <div className="absolute w-full h-full bottom-0 left-0 p-5" style={{ clipPath: `inset(0 ${priceFill} 0 0)` }}>
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1433 262"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1432.17 1.19653C970.361 214.838 14.2114 260.935 1.17822 260.935H1432.17V1.19653Z"
        fill="#000A2C"
      />
      <path
        d="M1.17822 260.935C14.2114 260.935 970.361 214.838 1432.17 1.19653"
        stroke="#227BED"
        stroke-linecap="round"
      />
    </svg>
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
}
