import Navbar from "../../components/Navbar";
import {
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  ArrowLongRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import router from "next/router";
import { useAccount, useContractRead, useSigner } from "wagmi";
import CoverCollectButton from "../../components/Buttons/CoverCollectButton";
import { BigNumber, ethers } from "ethers";
import { TickMath } from "../../utils/math/tickMath";
import { coverPoolABI } from "../../abis/evm/coverPool";
import { getClaimTick, mapUserCoverPositions } from "../../utils/maps";
import RemoveLiquidity from "../../components/Modals/Cover/RemoveLiquidity";
import AddLiquidity from "../../components/Modals/Cover/AddLiquidity";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { gasEstimateCoverBurn } from "../../utils/gas";
import { useCoverStore } from "../../hooks/useCoverStore";
import { fetchCoverTokenUSDPrice } from "../../utils/tokens";
import { fetchCoverPositions } from "../../utils/queries";
import DoubleArrowIcon from "../../components/Icons/DoubleArrowIcon";
import ExternalLinkIcon from "../../components/Icons/ExternalLinkIcon";
import { useCopyElementUseEffect } from "../../utils/misc";

export default function ViewCover() {
  const [
    coverPoolAddress,
    coverPoolData,
    coverPositionData,
    coverMintParams,
    tokenIn,
    tokenOut,
    needsRefetch,
    needsPosRefetch,
    latestTick,
    claimTick,
    setNeedsRefetch,
    setNeedsPosRefetch,
    setCoverPositionData,
    setTokenInCoverUSDPrice,
    setTokenOutCoverUSDPrice,
    setLatestTick,
    setClaimTick,
  ] = useCoverStore((state) => [
    state.coverPoolAddress,
    state.coverPoolData,
    state.coverPositionData,
    state.coverMintParams,
    state.tokenIn,
    state.tokenOut,
    state.needsRefetch,
    state.needsPosRefetch,
    state.latestTick,
    state.claimTick,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setCoverPositionData,
    state.setTokenInCoverUSDPrice,
    state.setTokenOutCoverUSDPrice,
    state.setLatestTick,
    state.setClaimTick,
  ]);

  const { address, isConnected } = useAccount();

  //cover aux
  const [priceDirection, setPriceDirection] = useState(false);
  const [coverFilledAmount, setCoverFilledAmount] = useState("");
  const [allCoverPositions, setAllCoverPositions] = useState([]);

  const volTierMap = new Map<string, any>([
    ["1000", { id: 0, volatility: "1" }],
    ["3000", { id: 1, volatility: "3" }],
    ["10000", { id: 2, volatility: "24" }],
  ]);

  //Display and copy flags
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [is0Copied, setIs0Copied] = useState(false);
  const [is1Copied, setIs1Copied] = useState(false);
  const [isPoolCopied, setIsPoolCopied] = useState(false);

  const [tokenZeroDisplay, setTokenZeroDisplay] = useState(
    tokenIn.address
      ? tokenIn.address.toString().substring(0, 6) +
          "..." +
          tokenIn.address
            .toString()
            .substring(
              tokenIn.address.toString().length - 4,
              tokenIn.address.toString().length
            )
      : undefined
  );
  const [tokenOneDisplay, setTokenOneDisplay] = useState(
    tokenOut.address
      ? tokenOut.address.toString().substring(0, 6) +
          "..." +
          tokenOut.address
            .toString()
            .substring(
              tokenOut.address.toString().length - 4,
              tokenOut.address.toString().length
            )
      : undefined
  );

  const [poolDisplay, setPoolDisplay] = useState(
    coverPoolAddress
      ? coverPoolAddress.toString().substring(0, 6) +
          "..." +
          coverPoolAddress
            .toString()
            .substring(
              coverPoolAddress.toString().length - 4,
              coverPoolAddress.toString().length
            )
      : undefined
  );

  useEffect(() => {
    setPoolDisplay(
      coverPoolAddress
        ? coverPoolAddress.toString().substring(0, 6) +
            "..." +
            coverPoolAddress
              .toString()
              .substring(
                coverPoolAddress.toString().length - 4,
                coverPoolAddress.toString().length
              )
        : undefined
    );
  }, [coverPoolAddress]);

  const [lowerInverse, setLowerInverse] = useState(0);
  const [upperInverse, setUpperInverse] = useState(0);
  const [priceInverse, setPriceInverse] = useState(0);

  ////////////////////////////////Addresses

  useEffect(() => {
    if (copyPoolAddress) {
      const timer = setTimeout(() => {
        setIsPoolCopied(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  });

  function copyPoolAddress() {
    navigator.clipboard.writeText(coverPoolAddress.toString());
    setIsPoolCopied(true);
  }

  ////////////////////////////////Token Order
  const [tokenOrder, setTokenOrder] = useState(true);
  const [priceOrder, setPriceOrder] = useState(true);

  useEffect(() => {
    if (tokenIn.address && tokenOut.address) {
      setTokenOrder(tokenIn.callId == 0);
    }
  }, [tokenIn, tokenOut]);

  //////////////////////////////// Pool Data

  useEffect(() => {
    if (coverPoolData.token0 && coverPoolData.token1) {
      if (tokenIn.address) {
        fetchCoverTokenUSDPrice(
          coverPoolData,
          tokenIn,
          setTokenInCoverUSDPrice
        );
      }
      if (tokenOut.address) {
        fetchCoverTokenUSDPrice(
          coverPoolData,
          tokenOut,
          setTokenOutCoverUSDPrice
        );
      }
    }
  }, []);

  useEffect(() => {
    getCoverPoolRatios();
  }, [tokenIn.coverUSDPrice, tokenOut.coverUSDPrice]);

  //TODO need to be set to utils
  const getCoverPoolRatios = () => {
    try {
      if (coverPoolData != undefined) {
        setLowerInverse(
          parseFloat(
            (
              tokenOut.coverUSDPrice /
              Number(
                TickMath.getPriceStringAtTick(Number(coverPositionData.max))
              )
            ).toPrecision(6)
          )
        );
        setUpperInverse(
          parseFloat(
            (
              tokenOut.coverUSDPrice /
              Number(
                TickMath.getPriceStringAtTick(Number(coverPositionData.min))
              )
            ).toPrecision(6)
          )
        );
        setPriceInverse(
          parseFloat(
            (
              tokenOut.coverUSDPrice /
              Number(
                TickMath.getPriceStringAtTick(
                  Number(coverPositionData.latestTick)
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

  ////////////////////////////////Position Data

  useEffect(() => {
    setTimeout(() => {
      if (
        needsRefetch == true ||
        needsPosRefetch == true ||
        coverPositionData.positionId == undefined
      ) {
        getUserCoverPositionData();
        setNeedsRefetch(false);
        setNeedsPosRefetch(false);
      }
    }, 1000);
  }, [needsRefetch, needsPosRefetch, coverPositionData.positionId]);

  async function getUserCoverPositionData() {
    try {
      const data = await fetchCoverPositions(address);
      if (data["data"]) {
        const positions = data["data"].positions;
        const positionData = mapUserCoverPositions(positions);
        setAllCoverPositions(positionData);
        const positionId =
          coverPositionData.positionId ?? router.query.positionId;
        const position = positionData.find(
          (position) => position.positionId == positionId
        );
        if (position != undefined) {
          setCoverPositionData(position);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////////////Filled Amount

  const { data: filledAmount } = useContractRead({
    address: coverPoolAddress,
    abi: coverPoolABI,
    functionName: "snapshot",
    args: [
      {
        owner: address,
        positionId: Number(coverPositionData.positionId),
        burnPercent: ethers.utils.parseUnits("1", 38),
        claim: BigNumber.from(claimTick),
        zeroForOne: Boolean(coverPositionData.zeroForOne),
      },
    ],
    chainId: 421613,
    watch: true,
    enabled:
      BigNumber.from(claimTick).lt(BigNumber.from("887272")) &&
      isConnected &&
      coverPoolAddress != undefined &&
      address != undefined,
    onError(error) {
      console.log("Error snapshot Cover", error);
    },
  });

  useEffect(() => {
    if (filledAmount) {
      setCoverFilledAmount(
        ethers.utils.formatUnits(filledAmount[3], tokenIn.decimals)
      );
    }
  }, [filledAmount]);

  ////////////////////////////////Latest Tick

  const { data: newLatestTick } = useContractRead({
    address: coverPoolAddress,
    abi: coverPoolABI,
    functionName: "syncLatestTick",
    chainId: 421613,
    enabled: coverPoolAddress != undefined && coverPoolAddress != ZERO_ADDRESS,
    onSuccess(data) {
      // setNeedsAllowance(false);
    },
    onError(error) {
      console.log("Error syncLatestTick", error);
    },
    onSettled(data, error) {},
  });

  ////////////////////////////////Claim Tick

  useEffect(() => {
    if (newLatestTick) {
      const latest = parseInt(newLatestTick.toString())
      updateClaimTick(latest)
      setLatestTick(latest)
    }
  }, [newLatestTick]);

  ////////////////////////////////Claim Tick

  async function updateClaimTick(latestTick: number) {
    const aux = await getClaimTick(
      coverPoolAddress.toString(),
      Number(coverPositionData.min),
      Number(coverPositionData.max),
      Boolean(coverPositionData.zeroForOne),
      Number(coverPositionData.epochLast),
      true,
      latestTick
    );
    setClaimTick(aux);
  }

  ////////////////////////////////

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
                    "https://goerli.arbiscan.io/address/" + coverPoolAddress
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
                  {
                    volTierMap.get(
                      coverPoolData.volatilityTier?.feeAmount?.toString()
                    )?.volatility
                  }
                  %
                </span>
                <div className="flex items-center gap-x-2 text-grey1 text-xs">
                  {coverPositionData.min === undefined
                    ? ""
                    : priceDirection
                    ? lowerInverse
                    : TickMath.getPriceStringAtTick(
                        Number(coverPositionData.min)
                      )}
                  <DoubleArrowIcon />
                  {coverPositionData.max === undefined
                    ? ""
                    : priceDirection
                    ? upperInverse
                    : TickMath.getPriceStringAtTick(
                        Number(coverPositionData.max)
                      )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-4 w-full md:w-auto">
            <button
              className="bg-main1 w-full border border-main text-main2 transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px]"
              onClick={() => setIsAddOpen(true)}
            >
              Add Liquidity
            </button>
            <button
              className="bg-black whitespace-nowrap w-full border border-grey transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px] text-grey1"
              onClick={() => setIsRemoveOpen(true)}
            >
              Remove Liquidity
            </button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row justify-between w-full mt-8  gap-10">
          <div className="border border-grey rounded-[4px] lg:w-1/2 w-full p-5">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">Remaining Liquidity</h1>
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  <span>
                    ~$
                    {(
                      Number(
                        ethers.utils.formatUnits(
                          coverPositionData.userFillOut ?? 0,
                          tokenOrder ? tokenIn.decimals : tokenOut.decimals
                        )
                      ) * tokenIn.coverUSDPrice
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {Number(
                    ethers.utils.formatUnits(
                      coverPositionData.userFillOut ?? 0,
                      tokenOrder ? tokenIn.decimals : tokenOut.decimals
                    )
                  ).toFixed(2)}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      <img height="28" width="25" src={tokenIn.logoURI} />
                      {tokenIn.symbol}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-8">
                <div className="flex items-center gap-x-4">
                  <h1 className="uppercase text-white md:block hidden">
                    Price Range
                  </h1>
                  {coverPositionData.min &&
                  coverPositionData.max &&
                  coverPositionData.latestTick ? (
                    parseFloat(
                      TickMath.getPriceStringAtTick(
                        Number(coverPositionData.latestTick)
                      )
                    ) <
                      parseFloat(
                        TickMath.getPriceStringAtTick(
                          Number(coverPositionData.min)
                        )
                      ) ||
                    parseFloat(
                      TickMath.getPriceStringAtTick(
                        Number(coverPositionData.latestTick)
                      )
                    ) >=
                      parseFloat(
                        TickMath.getPriceStringAtTick(
                          Number(coverPositionData.max)
                        )
                      ) ? (
                      <span className="text-yellow-600 text-xs bg-yellow-900/30 px-4 py-1 rounded-[4px]">
                        OUT OF RANGE
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs bg-green-900/30 px-4 py-1 rounded-[4px]">
                        IN RANGE
                      </span>
                    )
                  ) : null}
                </div>
                <div
                  onClick={() => setPriceDirection(!priceDirection)}
                  className="text-grey1 cursor-pointer flex items-center text-xs gap-x-2 uppercase"
                >
                  {Boolean(coverPositionData.zeroForOne)
                    ? priceDirection
                      ? tokenOut.symbol
                      : tokenIn.symbol
                    : priceDirection
                    ? tokenIn.symbol
                    : tokenOut.symbol}{" "}
                  per{" "}
                  {Boolean(coverPositionData.zeroForOne)
                    ? priceDirection
                      ? tokenIn.symbol
                      : tokenOut.symbol
                    : priceDirection
                    ? tokenOut.symbol
                    : tokenIn.symbol}
                  <DoubleArrowIcon />
                </div>
              </div>
              <div className="flex flex-col gap-y-4">
                <div className="flex items-center gap-x-5 mt-3">
                  <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs">MIN. PRICE</span>
                    <span className="text-white text-2xl md:text-3xl">
                      {coverPositionData.min === undefined
                        ? ""
                        : priceDirection
                        ? lowerInverse
                        : TickMath.getPriceStringAtTick(
                            Number(coverPositionData.min)
                          )}
                    </span>
                    <span className="text-grey1 text-[9px] text-center">
                      Your position will be 100%{" "}
                      {Boolean(coverPositionData.zeroForOne)
                        ? priceDirection
                          ? tokenIn.symbol
                          : tokenOut.symbol
                        : priceDirection
                        ? tokenOut.symbol
                        : tokenIn.symbol}{" "}
                      at this price.
                    </span>
                  </div>
                  <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                    <span className="text-grey1 text-xs">MAX. PRICE</span>
                    <span className="text-white text-2xl md:text-3xl">
                      {coverPositionData.max === undefined
                        ? ""
                        : priceDirection
                        ? upperInverse
                        : TickMath.getPriceStringAtTick(
                            Number(coverPositionData.max)
                          )}
                    </span>
                    <span className="text-grey1 text-[9px] text-center">
                      Your position will be 100%{" "}
                      {Boolean(coverPositionData.zeroForOne)
                        ? priceDirection
                          ? tokenOut.symbol
                          : tokenIn.symbol
                        : priceDirection
                        ? tokenIn.symbol
                        : tokenOut.symbol}{" "}
                      at this price.
                    </span>
                  </div>
                </div>
                <div className="border border-grey rounded-[4px] flex flex-col w-full items-center justify-center gap-y-3 h-32">
                  <span className="text-grey1 text-xs">CURRENT. PRICE</span>
                  <span className="text-white text-3xl text-grey1">
                    {coverPositionData.latestTick
                      ? priceDirection
                        ? priceInverse
                        : TickMath.getPriceStringAtTick(
                            Number(coverPositionData?.latestTick)
                          )
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="border bg-dark border-grey rounded-[4px] lg:w-1/2 w-full p-5 h-min">
            <div className="flex justify-between">
              <h1 className="uppercase text-white">Filled Liquidity</h1>
              {coverPositionData.userFillIn ? (
                <span className="text-grey1">
                  ${Number(coverFilledAmount).toFixed(2)}
                  <span className="text-grey">
                    /
                    {Number(
                      ethers.utils.formatUnits(
                        coverPositionData.userFillIn.toString(),
                        tokenOrder ? tokenOut.decimals : tokenIn.decimals
                      )
                    ).toFixed(2)}
                  </span>
                </span>
              ) : null}
            </div>
            <div className="flex flex-col gap-y-3 mt-2">
              <div className="border bg-black border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                <div className="flex items-end justify-between text-[11px] text-grey1">
                  <span>
                    ~$
                    {(
                      Number(coverFilledAmount) * tokenOut.coverUSDPrice
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-end justify-between mt-2 mb-3 text-3xl">
                  {Number(coverFilledAmount).toFixed(2)}
                  <div className="flex items-center gap-x-2">
                    <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] md:min-w-[160px]">
                      <img height="28" width="25" src={tokenOut.logoURI} />
                      {tokenOut.symbol}
                    </div>
                  </div>
                </div>
              </div>
              {/**TO-DO: PASS PROPS */}
              <CoverCollectButton
                poolAddress={coverPoolAddress}
                address={address}
                positionId={coverPositionData.positionId}
                claim={BigNumber.from(claimTick)}
                zeroForOne={Boolean(coverPositionData.zeroForOne)}
                gasLimit={coverMintParams.gasLimit.mul(150).div(100)}
                gasFee={coverMintParams.gasFee}
              />
              {/*TO-DO: add positionOwner ternary again*/}
            </div>
          </div>
        </div>
      </div>
      {coverPositionData.userFillIn ? (
        <>
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
        </>
      ) : null}
    </div>
  );
}
