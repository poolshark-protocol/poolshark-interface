import { PropsWithChildren } from "react";
import { BN_ZERO } from "../../../utils/math/constants";
import { numFormat } from "../../../utils/math/valueMath";
import { BigNumber, ethers } from "ethers";

const Option = ({
  pairSelected,
  amountOut,
  decimals,
  children,
}: {
  pairSelected: boolean;
  amountOut: BigNumber;
  decimals: number;
} & PropsWithChildren) => {
  return (
    <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
      <div className="flex p-1">
        <div className="text-xs text-[#4C4C4C]">Expected Output</div>
        <div
          className={`ml-auto text-xs ${
            pairSelected ? "text-white" : "text-[#4C4C4C]"
          }`}
        >
          {pairSelected
            ? numFormat(
                parseFloat(
                  ethers.utils.formatUnits(amountOut ?? BN_ZERO, decimals),
                ),
                5,
              )
            : "Select Token"}
        </div>
      </div>
      {children}
    </div>
  );
};

export default Option;
