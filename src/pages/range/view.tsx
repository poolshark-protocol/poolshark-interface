import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import RangeCompoundButton from "../../components/Buttons/RangeCompoundButton";
import { useAccount } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { TickMath } from "../../utils/math/tickMath";
import JSBI from "jsbi";
import { copyElementUseEffect } from "../../utils/misc";
import { DyDxMath } from "../../utils/math/dydxMath";
import { rangePoolABI } from "../../abis/evm/rangePool";
import { useContractRead } from "wagmi";
import RemoveLiquidity from "../../components/Modals/Range/RemoveLiquidity";
import AddLiquidity from "../../components/Modals/Range/AddLiquidity";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { fetchRangeTokenUSDPrice } from "../../utils/tokens";
import { fetchRangePositions } from "../../utils/queries";
import { mapUserRangePositions } from "../../utils/maps";
import DoubleArrowIcon from "../../components/Icons/DoubleArrowIcon";
import ExternalLinkIcon from "../../components/Icons/ExternalLinkIcon";

export default function ViewRange() {
  const [
    rangePoolAddress,
    rangePoolData,
    rangePositionData,
    rangeMintParams,
    tokenIn,
    tokenOut,
    setTokenInRangeUSDPrice,
    setTokenOutRangeUSDPrice,
    needsRefetch,
    needsPosRefetch,
    setNeedsRefetch,
    setNeedsPosRefetch,
    setRangePositionData,
    setMintButtonState,
  ] = useRangeLimitStore((state) => [
    state.rangePoolAddress,
    state.rangePoolData,
    state.rangePositionData,
    state.rangeMintParams,
    state.tokenIn,
    state.tokenOut,
    state.setTokenInRangeUSDPrice,
    state.setTokenOutRangeUSDPrice,
    state.needsRefetch,
    state.needsPosRefetch,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setRangePositionData,
    state.setMintButtonState,
  ]);

  const { address, isConnected } = useAccount();

  const [snapshot, setSnapshot] = useState(undefined);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [priceDirection, setPriceDirection] = useState(false);
  const [allRangePositions, setAllRangePositions] = useState([]);
  const [userLiquidityUsd, setUserLiquidityUsd] = useState(0);
  const [lowerPrice, setLowerPrice] = useState("");
  const [upperPrice, setUpperPrice] = useState("");
  const [amount0, setAmount0] = useState(0);
  const [amount1, setAmount1] = useState(0);
  const [amount0Usd, setAmount0Usd] = useState(0);
  const [amount1Usd, setAmount1Usd] = useState(0);
  const [amount0Fees, setAmount0Fees] = useState(0.0);
  const [amount1Fees, setAmount1Fees] = useState(0.0);
  const [amount0FeesUsd, setAmount0FeesUsd] = useState(0.0);
  const [amount1FeesUsd, setAmount1FeesUsd] = useState(0.0);
  const [is0Copied, setIs0Copied] = useState(false);
  const [is1Copied, setIs1Copied] = useState(false);
  const [isPoolCopied, setIsPoolCopied] = useState(false);
  const [lowerInverse, setLowerInverse] = useState(0);
  const [upperInverse, setUpperInverse] = useState(0);
  const [priceInverse, setPriceInverse] = useState(0);
  const [tokenZeroDisplay, setTokenZeroDisplay] = useState(
    tokenIn.address != ("" as string)
      ? tokenIn.address.substring(0, 6) +
          "..." +
          tokenIn.address.substring(
            tokenIn.address.length - 4,
            tokenIn.address.length
          )
      : undefined
  );
  const [tokenOneDisplay, setTokenOneDisplay] = useState(
    tokenOut.address != ("" as string)
      ? tokenOut.address.substring(0, 6) +
          "..." +
          tokenOut.address.substring(
            tokenOut.address.length - 4,
            tokenOut.address.length
          )
      : undefined
  );
  const [poolDisplay, setPoolDisplay] = useState(
    rangePoolAddress != ("" as string)
      ? rangePoolAddress.substring(0, 6) +
          "..." +
          rangePoolAddress.substring(
            rangePoolAddress.length - 4,
            rangePoolAddress.length
          )
      : undefined
  );

  ////////////////////////Addresses

  useEffect(() => {
    copyElementUseEffect(copyAddress0, setIs0Copied);
    copyElementUseEffect(copyAddress1, setIs1Copied);
    copyElementUseEffect(copyRangePoolAddress, setIsPoolCopied);
  }, []);

  function copyAddress0() {
    navigator.clipboard.writeText(tokenIn.address.toString());
    setIs0Copied(true);
  }

  function copyAddress1() {
    navigator.clipboard.writeText(tokenOut.address.toString());
    setIs1Copied(true);
  }

  function copyRangePoolAddress() {
    navigator.clipboard.writeText(rangePoolAddress.toString());
    setIsPoolCopied(true);
  }

  ////////////////////////Pool

  useEffect(() => {
    getRangePoolRatios();
  }, [amount0, amount1, amount0Fees, amount1Fees]);

  const getRangePoolRatios = () => {
    try {
      if (rangePoolData != undefined) {
        setAmount0Usd(
          parseFloat((amount0 * tokenIn.rangeUSDPrice).toPrecision(6))
        );
        setAmount1Usd(
          parseFloat((amount1 * tokenOut.rangeUSDPrice).toPrecision(6))
        );
        setAmount0FeesUsd(
          parseFloat((amount0Fees * tokenIn.rangeUSDPrice).toPrecision(3))
        );
        setAmount1FeesUsd(
          parseFloat((amount1Fees * tokenOut.rangeUSDPrice).toPrecision(3))
        );
        setLowerInverse(
          parseFloat(
            (tokenOut.rangeUSDPrice / parseFloat(upperPrice)).toPrecision(6)
          )
        );
        setUpperInverse(
          parseFloat(
            (tokenOut.rangeUSDPrice / parseFloat(lowerPrice)).toPrecision(6)
          )
        );
        setPriceInverse(
          parseFloat(
            (
              tokenOut.rangeUSDPrice /
              parseFloat(
                TickMath.getPriceStringAtSqrtPrice(
                  JSBI.BigInt(String(rangePoolData.poolPrice))
                )
              )
            ).toPrecision(6)
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  ////////////////////////Liquidity

  useEffect(() => {
    if (rangePoolData.token0 && rangePoolData.token1) {
      if (tokenIn.address) {
        fetchRangeTokenUSDPrice(
          rangePoolData,
          tokenIn,
          setTokenInRangeUSDPrice
        );
      }
      if (tokenOut.address) {
        fetchRangeTokenUSDPrice(
          rangePoolData,
          tokenOut,
          setTokenOutRangeUSDPrice
        );
      }
    }
  }, []);

  useEffect(() => {
    setLowerPrice(TickMath.getPriceStringAtTick(Number(rangePositionData.min)));
    setUpperPrice(TickMath.getPriceStringAtTick(Number(rangePositionData.max)));
  }, [tokenIn, tokenOut]);

  useEffect(() => {
    setAmounts();
  }, [lowerPrice, upperPrice]);

  function setAmounts() {
    try {
      if (
        !isNaN(parseFloat(lowerPrice)) &&
        !isNaN(parseFloat(upperPrice)) &&
        !isNaN(parseFloat(String(rangePoolData.poolPrice))) &&
        Number(rangePositionData.userLiquidity) > 0 &&
        parseFloat(lowerPrice) < parseFloat(upperPrice)
      ) {
        const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(
          Number(rangePositionData.min)
        );
        const upperSqrtPrice = TickMath.getSqrtRatioAtTick(
          Number(rangePositionData.max)
        );
        const rangeSqrtPrice = JSBI.BigInt(rangePoolData.poolPrice);
        const liquidity = JSBI.BigInt(rangePositionData.userLiquidity);
        const amounts = DyDxMath.getAmountsForLiquidity(
          lowerSqrtPrice,
          upperSqrtPrice,
          rangeSqrtPrice,
          liquidity,
          true
        );
        // set amount based on bnInput
        const amount0Bn = BigNumber.from(String(amounts.token0Amount));
        const amount1Bn = BigNumber.from(String(amounts.token1Amount));
        setAmount0(
          parseFloat(ethers.utils.formatUnits(amount0Bn, tokenIn.decimals))
        );
        setAmount1(
          parseFloat(ethers.utils.formatUnits(amount1Bn, tokenIn.decimals))
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setUserLiquidityUsd(amount0Usd + amount1Usd);
  }, [amount0Usd, amount1Usd]);

  async function getUserRangePositionData() {
    try {
      const data = await fetchRangePositions(address);
      if (data["data"])
        setAllRangePositions(
          mapUserRangePositions(data["data"].positionFractions)
        );
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      if (needsRefetch == true || needsPosRefetch == true) {
        getUserRangePositionData();

        const positionId = rangePositionData.id;
        const position = allRangePositions.find(
          (position) => position.id == positionId
        );
        console.log("new position", position);

        if (position != undefined) {
          setRangePositionData(position);
        }

        setNeedsRefetch(false);
        setNeedsPosRefetch(false);
      }
    }, 5000);
  }, [needsRefetch, needsPosRefetch]);

  ////////////////////////Fees

  const { refetch: refetchSnapshot, data: feesOwed } = useContractRead({
    address: rangePoolAddress,
    abi: rangePoolABI,
    functionName: "snapshot",
    args: [[address, rangePositionData.min, rangePositionData.max]],
    chainId: 421613,
    watch: true,
    enabled: isConnected && rangePoolAddress != ("" as string),
    onSuccess(data) {
      setSnapshot(data);
      console.log("Success snapshot Range", data);
    },
    onError(error) {
      console.log(
        "snapshot args",
        address,
        rangePositionData.min.toString(),
        rangePositionData.max.toString()
      );
      console.log("Error snapshot Range", error);
    },
  });

  useEffect(() => {
    setFeesOwed();
  }, [snapshot]);

  function setFeesOwed() {
    try {
      if (snapshot) {
        console.log("snapshot", snapshot.toString());
        const fees0 = parseFloat(
          ethers.utils.formatUnits(snapshot[2], tokenIn.decimals)
        );
        const fees1 = parseFloat(
          ethers.utils.formatUnits(snapshot[3], tokenIn.decimals)
        );
        console.log(
          "fees owed 1",
          ethers.utils.formatUnits(snapshot[3], tokenIn.decimals)
        );
        setAmount0Fees(fees0);
        setAmount1Fees(fees1);
      }
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////////////Mint Button Handler

  useEffect(() => {
    setMintButtonState();
  }, [tokenIn, rangeMintParams.tokenInAmount]);

  ////////////////////////////////Return

  return (
    <div className="bg-black min-h-screen  ">
      <Navbar />
      <div className="flex flex-col pt-10 pb-32 md:pb-0 text-white relative min-h-[calc(100vh-76px)] container mx-auto md:px-0 px-3">
        <div className="flex md:flex-row flex-col justify-between w-full items-start md:items-center gap-y-5">
          <div className="flex items-center gap-x-3">
            <div className="flex items-center">
              <img height="50" width="50" src={tokenIn.logoURI} />
              <img
                height="50"
                width="50"
                className="ml-[-12px]"
                src={tokenOut.logoURI}
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center text-white">
                <h1>
                  {tokenIn.symbol}-{tokenOut.symbol}
                </h1>
                <a
                  href={
                    "https://goerli.arbiscan.io/address/" + rangePoolAddress
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-x-3 text-grey1 group cursor-pointer"
                >
                  <span className="-mb-1 text-light text-xs ml-8 group-hover:underline">
                    {poolDisplay}
                  </span>{" "}
                  <ExternalLinkIcon />
                </a>
              </div>
              <div className="flex items-center gap-x-5">
                <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                  {Number(rangePositionData.feeTier) / 10000}%
                </span>
                <div className="flex items-center gap-x-2 text-grey1 text-xs">
                {priceDirection ? <>{lowerInverse}</> : <>{lowerPrice}</>}
                  <DoubleArrowIcon />
                  {priceDirection ? <>{upperInverse}</> : <>{upperPrice}</>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-4 w-full md:w-auto">
            <button
              className="bg-main1 border w-full border-main text-main2 transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px]"
              onClick={() => setIsAddOpen(true)}
            >
              Add Liquidity
            </button>
            <button
              className="bg-black border w-full border-grey transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px] text-grey1"
              onClick={() => setIsRemoveOpen(true)}
            >
              Remove Liquidity
            </button>
          </div>
        </div>
        <div className="flex lg:flex-row flex-col justify-between w-full mt-8 gap-10">
          <div className="border border-grey rounded-[4px] lg:w-1/2 w-full p-5">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">Liquidity</h1>
              <span className="text-grey1">${userLiquidityUsd.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  <span>~${amount0Usd}</span>
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {amount0.toFixed(2)}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      <img height="28" width="25" src={tokenIn.logoURI} />
                      {tokenIn.symbol}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  <span>~${amount1Usd}</span>
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {amount1.toFixed(2)}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      <img height="28" width="25" src={tokenOut.logoURI} />
                      {tokenOut.symbol}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-8">
                <div className="flex items-center gap-x-4">
                  <h1 className="uppercase text-white md:block hidden">
                    Price Range
                  </h1>
                  {Number(rangePoolData.tickAtPrice) <
                    Number(rangePositionData.min) ||
                  Number(rangePoolData.tickAtPrice) >=
                    Number(rangePositionData.max) ? (
                    <span className="text-yellow-600 text-xs bg-yellow-900/30 px-4 py-1 rounded-[4px]">
                      OUT OF RANGE
                    </span>
                  ) : (
                    <span className="text-green-600 text-xs bg-green-900/30 px-4 py-1 rounded-[4px]">
                      IN RANGE
                    </span>
                  )}
                </div>
                <div
                  onClick={() => setPriceDirection(!priceDirection)}
                  className="text-grey1 cursor-pointer flex items-center text-xs gap-x-2 uppercase"
                >
                  {priceDirection ? (
                    <>{tokenIn.symbol}</>
                  ) : (
                    <>{tokenOut.symbol}</>
                  )}{" "}
                  per{" "}
                  {priceDirection ? (
                    <>{tokenOut.symbol}</>
                  ) : (
                    <>{tokenIn.symbol}</>
                  )}{" "}
                  <DoubleArrowIcon />
                </div>
              </div>
              <div className="flex flex-col gap-y-4">
                <div className="flex items-center gap-x-5 mt-3">
                  <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs">MIN. PRICE</span>
                    <span className="text-white  md:text-3xl text-2xl">
                      {priceDirection ? <>{lowerInverse}</> : <>{lowerPrice}</>}
                    </span>
                    <span className="text-grey1 text-[9px] text-center">
                      Your position will be 100%{" "}
                      {priceDirection ? tokenOut.symbol : tokenIn.symbol} at
                      this price.
                    </span>
                  </div>
                  <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs">MAX. PRICE</span>
                    <span className="text-white  md:text-3xl text-2xl">
                      {priceDirection ? <>{upperInverse}</> : <>{upperPrice}</>}
                    </span>
                    <span className="text-grey1 text-[9px] text-center">
                      Your position will be 100%{" "}
                      {priceDirection ? tokenIn.symbol : tokenOut.symbol} at
                      this price.
                    </span>
                  </div>
                </div>
                <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                  <span className="text-grey1 text-xs">CURRENT. PRICE</span>
                  <span className="text-white text-3xl text-grey1">
                    {rangePositionData.price != undefined && priceDirection
                      ? priceInverse
                      : TickMath.getPriceStringAtSqrtPrice(
                          JSBI.BigInt(rangePositionData.price)
                        )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="border bg-dark border-grey rounded-[4px] lg:w-1/2 w-full p-5 h-min">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">Earned Fees</h1>
              <span className="text-grey1">${userLiquidityUsd.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  <span>~${amount0Usd}</span>
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {amount0.toFixed(2)}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      <img height="28" width="25" src={tokenIn.logoURI} />
                      {tokenIn.symbol}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2 mb-5">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  <span>~${amount1Usd}</span>
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {amount1.toFixed(2)}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      <img height="28" width="25" src={tokenOut.logoURI} />
                      {tokenOut.symbol}
                    </div>
                  </div>
                </div>
              </div>
              <RangeCompoundButton
                poolAddress={rangePoolAddress}
                address={address}
                positionId={rangePositionData.id}
              />
            </div>
          </div>
        </div>
      </div>
      <RemoveLiquidity
        isOpen={isRemoveOpen}
        setIsOpen={setIsRemoveOpen}
        address={address}
      />
      <AddLiquidity
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        address={address}
      />
    </div>
  );
}
