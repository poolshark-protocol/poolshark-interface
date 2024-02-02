function USDPriceDisplay({ token, display }) {
  return (
    <span>
      ~$
      {!isNaN(token.decimals) && !isNaN(token.USDPrice) && token.USDPrice != "0"
        ? (
            (!isNaN(parseFloat(display)) ? parseFloat(display) : 0) *
            (token.USDPrice ?? 0)
          ).toFixed(2)
        : "-.--"}
    </span>
  );
}

export default USDPriceDisplay;
