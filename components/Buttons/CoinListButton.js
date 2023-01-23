function CoinListButton({ chooseToken, coin }) {
    return(
        <div>
            <button onClick={chooseToken}
                data-name={coin.name}
                data-logouri={coin.logoURI}
                data-symbol={coin.symbol}
                data-address={coin.address}
                key={coin.id}
            >
                <img onClick={chooseToken}
                    data-name={coin.name}
                    data-logouri={coin.logoURI}
                    data-decimals={coin.decimals}
                    data-symbol={coin.symbol}
                    data-address={coin.id} alt="?"
                    src={coin.logoURI} 
                />
                
            </button>
        </div>
    );
}

export default CoinListButton