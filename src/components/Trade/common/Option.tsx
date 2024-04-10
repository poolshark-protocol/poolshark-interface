import { PropsWithChildren, useState } from "react";
import { BN_ZERO, ZERO_ADDRESS } from "../../../utils/math/constants";
import { numFormat } from "../../../utils/math/valueMath";
import { ethers } from "ethers";
import { ChevronDownIcon } from "lucide-react";
import { useTradeStore } from "../../../hooks/useTradeStore";
import { displayPoolPrice } from "../../../utils/math/priceMath";

const Option = ({ children }: {} & PropsWithChildren) => {
  const [expanded, setExpanded] = useState(false);
  const tradeStore = useTradeStore();

  return (
    <div className="py-4">
      <div
        className="flex px-2 cursor-pointer py-2 rounded-[4px]"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-none text-xs uppercase text-[#C9C9C9]">
          {"1 " + tradeStore.tokenIn.symbol} ={" "}
          {tradeStore.tradePoolData?.id != ZERO_ADDRESS
            ? displayPoolPrice(
                tradeStore.wethCall,
                tradeStore.pairSelected,
                tradeStore.tradePoolData?.poolPrice,
                tradeStore.tokenIn,
                tradeStore.tokenOut,
              ) +
              " " +
              tradeStore.tokenOut.symbol
            : "?"}
        </div>
        <div className="ml-auto text-xs uppercase text-[#C9C9C9]">
          <button>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-wrap w-full break-normal transition ">
        {expanded && (
          <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
            <div className="flex p-1">
              <div className="text-xs text-[#4C4C4C]">Expected Output</div>
              <div
                className={`ml-auto text-xs ${
                  tradeStore.pairSelected ? "text-white" : "text-[#4C4C4C]"
                }`}
              >
                {tradeStore.pairSelected
                  ? numFormat(
                      parseFloat(
                        ethers.utils.formatUnits(
                          tradeStore.amountOut ?? BN_ZERO,
                          tradeStore.tokenOut.decimals,
                        ),
                      ),
                      5,
                    )
                  : "Select Token"}
              </div>
            </div>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default Option;
