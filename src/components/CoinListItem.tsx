import useTokenBalance from '../hooks/useTokenBalance'

function CoinListItem({ chooseToken, coin }) {
  const [tokenBalanceInfo, tokenBalanceBox] = useTokenBalance(coin?.address)

  return (
    <div
      className="bg-dark text-white"
      // onClick={chooseToken(coin)}
      data-name={coin.name}
      data-logouri={coin.logoURI}
      data-symbol={coin.symbol}
      key={coin.name}
      data-decimals={coin.decimals}
      data-address={coin.id}
    >
      <button
        onClick={() => chooseToken(coin)}
        className="border border-t-grey1 border-transparent px-5 py-2 flex justify-between items-start w-full"
      >
        <div className="flex items-start gap-x-3">
          <img className="w-8 h-8" src={coin.logoURI} />
          <div className="flex flex-col gap-y-[.5px] items-start ">
            <h1 className="w-full text-sm">{coin.name}</h1>
            <span className="text-[11px] text-grey">{coin.symbol}</span>
          </div>
        </div>
        <span>
          {!Number.isNaN(tokenBalanceBox().props.children[1])
            ? Number(tokenBalanceBox().props.children[1]) >= 1000000
              ? Number(tokenBalanceBox().props.children[1])
                  .toExponential(5)
                  .toString()
              : Number(tokenBalanceBox().props.children[1]).toString()
            : "0"}
        </span>
      </button>
    </div>
  );
}

export default CoinListItem;
