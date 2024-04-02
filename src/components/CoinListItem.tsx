import { useShallow } from "zustand/react/shallow";
import { useConfigStore } from "../hooks/useConfigStore";
import useTokenBalance from "../hooks/useTokenBalance";
import { getTokenBalance } from "../utils/config";

function CoinListItem({ chooseToken, coin }) {
  const { data: tokenBalanceInfo } = useTokenBalance(coin);

  const [chainId] = useConfigStore(useShallow((state) => [state.chainId]));

  return (
    <div
      className="bg-dark text-white"
      data-name={coin.name}
      data-logouri={coin.logoURI}
      data-symbol={coin.symbol}
      key={coin.address}
      data-decimals={coin.decimals}
      data-address={coin.id + coin.symbol}
    >
      <button
        onClick={() => chooseToken(coin)}
        className="border border-t-grey border-transparent px-5 py-2 flex justify-between items-start w-full"
      >
        <div className="flex items-start gap-x-3">
          <img className="w-8 h-8" src={coin.logoURI} />
          <div className="flex flex-col gap-y-[.5px] items-start ">
            <h1 className="w-full text-sm">{coin.name}</h1>
            <span className="text-[11px] text-grey2">{coin.symbol}</span>
          </div>
        </div>
        <span>{getTokenBalance(chainId, coin, tokenBalanceInfo)}</span>
      </button>
    </div>
  );
}

export default CoinListItem;
