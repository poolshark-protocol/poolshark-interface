import React from "react";

function ChainImage({ chainId }) {
  if (chainId == 42161 || chainId == 421614) {
    return (
      <img
        style={{ width: 17, height: 17 }}
        src="https://poolshark-token-lists.s3.amazonaws.com/images/arb_icon.svg"
        className={`aspect-square ${chainId === 421614 && "saturate-0"}`}
      />
    );
  } else if (chainId == 534352 || chainId == 534351) {
    return (
      <img
        style={{ width: 17, height: 17 }}
        src="https://scroll-tech.github.io/token-list/scroll.png"
        className={`aspect-square ${chainId === 534351 && "saturate-0"}`}
      />
    );
  } else if (chainId == 34443) {
    return (
      <img
        style={{ width: 17, height: 17 }}
        src="https://poolshark-token-lists.s3.amazonaws.com/images/mode_icon.svg"
        className={`aspect-square ${chainId === 534351 && "saturate-0"}`}
      />
    );
  } else if (chainId == 2525) {
    return (
      <img
        style={{ width: 17, height: 17 }}
        src="https://poolshark-token-lists.s3.amazonaws.com/images/in_evm_alt.svg"
        className={`aspect-square ${chainId === 534351 && "saturate-0"}`}
      />
    );
  } else {
    return <></>;
  }
}

export default ChainImage;
