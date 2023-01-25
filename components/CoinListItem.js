import useTokenBalance from "../hooks/useTokenBalance";

function CoinListItem({ chooseToken, coin }){
    const [tokenBalanceInfo, tokenBalanceBox] = useTokenBalance();

    return(
                                      <div className="bg-dark text-white"
                                      onClick={chooseToken}
                data-name={coin.name}
                data-logouri={coin.logoURI}
                data-symbol={coin.symbol}
                key={coin.name}
                data-decimals={coin.decimals}
                data-address={coin.id}>
                                <div className="border border-t-grey1 border-transparent px-5 py-2 flex justify-between items-center">
                                  <div className="flex items-center gap-x-3">
                                    <img
                                      className="w-8 h-8"
                                      src={coin.logoURI}
                                    />
                                    <div>
                                      <h1 className="w-full text-sm -mb-2">
                                        {coin.name}
                                      </h1>
                                      <span className="w-full text-[11px] text-grey">
                                        {coin.symbol}
                                      </span>
                                    </div>
                                  </div>
                                  {tokenBalanceBox()}
                                </div>
                                </div>
    );
}

export default CoinListItem