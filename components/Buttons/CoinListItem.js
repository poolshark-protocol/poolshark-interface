import useTokenBalance from "../../hooks/useTokenBalance";

function CoinListItem({ chooseToken, coin }){
    const [tokenBalanceInfo, tokenBalanceBox] = useTokenBalance();

    return(
        <div data-name={coin.name}>
            <button onClick={chooseToken}
                data-name={coin.name}
                data-logouri={coin.logoURI}
                data-symbol={coin.symbol}
                key={coin.name}
                data-decimals={coin.decimals}
                data-address={coin.id}
            >
            </button>
            <div>
                <img src={coin.logoURI} />
                <div>
                    <div>
                        <div>{coin.symbol}</div>
                        <div>{coin.name}</div>
                    </div>
                </div>
                <div>
                    <div>{tokenBalanceBox()}</div>
                </div>
            </div>
        </div>
    );
}

export default CoinListItem