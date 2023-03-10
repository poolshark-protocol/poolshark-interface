import React from "react";

function CoinListButton({ chooseToken, coin }) {
  return(
      <button
      onClick={() => chooseToken(coin)}
              data-name={coin.name}
              data-logouri={coin.logoURI}
              data-symbol={coin.symbol}
              data-address={coin.address}
              key={coin.id}
       className="flex items-center gap-x-2 text-white border-grey1 border p-1.5 px-3 rounded-xl text-sm">
                                  <img
                                    className="w-6"
                                    src={coin.logoURI} 
                                  />
                                  {coin.symbol}
                                </button>
  );
}

export default CoinListButton