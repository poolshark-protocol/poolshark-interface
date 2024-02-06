import { useEffect, useState } from "react";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties } from "../../utils/chains";
import axios from "axios";
import { ZERO_ADDRESS } from "../../utils/math/constants";

function USDPriceDisplay({ token, display }) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const [priceFromAPI, setPriceFromAPI] = useState(undefined);

  function fetchUSDPriceFromDefined() {
    axios
      .post(
        "https://graph.defined.fi/graphql",
        {
          query: `{
                getTokenPrices(
                  inputs: [
                    { address: "${token.address}", networkId: ${chainId}}
                  ]
                ) {
                  address
                  networkId
                  priceUsd
                }
              }`,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "944ebfd6779a45fede53b997d2c32b1e2333e316",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        setPriceFromAPI(
          response.data.data?.getTokenPrices[0]?.priceUsd ?? undefined
        );
      });
  }

  //try to fetch it from the subgraph, if the token doesnt exist in the subgraph, fetch it from defined.fi

  useEffect(() => {
    if (
      token.address != ZERO_ADDRESS &&
      token.USDPrice == "0" &&
      chainProperties[networkName].sdkSupport.defined
    ) {
      console.log("timestamp", Date.now() / 1000);
      fetchUSDPriceFromDefined();
    }
  }, [token.address, chainId]);

  return (
    <span>
      ~$
      {!isNaN(token.decimals) && !isNaN(token.USDPrice) && token.USDPrice != "0"
        ? (
            (!isNaN(parseFloat(display)) ? parseFloat(display) : 0) *
            (token.USDPrice ?? 0)
          ).toFixed(2)
        : priceFromAPI
        ? (
            (!isNaN(parseFloat(display)) ? parseFloat(display) : 0) *
            (priceFromAPI ?? 0)
          ).toFixed(2)
        : "-.--"}
    </span>
  );
}

export default USDPriceDisplay;
