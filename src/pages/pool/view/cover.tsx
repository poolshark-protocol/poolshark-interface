import Navbar from "../../../components/Navbar";
import {
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  ArrowLongRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount, useContractRead, useSigner } from "wagmi";
import CoverCollectButton from "../../../components/Buttons/CoverCollectButton";
import { BigNumber, ethers } from "ethers";
import { TickMath } from "../../../utils/math/tickMath";
import { coverPoolABI } from "../../../abis/evm/coverPool";
import { copyElementUseEffect } from "../../../utils/misc";
import { getClaimTick, mapUserCoverPositions } from "../../../utils/maps";
import RemoveLiquidity from "../../../components/Modals/Cover/RemoveLiquidity";
import AddLiquidity from "../../../components/Modals/Cover/AddLiquidity";
import { BN_ZERO } from "../../../utils/math/constants";
import { gasEstimateCoverBurn } from "../../../utils/gas";
import { useCoverStore } from "../../../hooks/useCoverStore";
import { fetchCoverTokenUSDPrice } from "../../../utils/tokens";
import { fetchCoverPositions } from "../../../utils/queries";

export default function Cover() {
  const [
    coverPoolAddress,
    coverPoolData,
    coverPositionData,
    coverMintParams,
    tokenIn,
    tokenOut,
    needsRefetch,
    needsPosRefetch,
    claimTick,
    setNeedsRefetch,
    setNeedsPosRefetch,
    setCoverPositionData,
    setTokenInCoverUSDPrice,
    setTokenOutCoverUSDPrice,
    setClaimTick,
    setGasFee,
    setGasLimit,
  ] = useCoverStore((state) => [
    state.coverPoolAddress,
    state.coverPoolData,
    state.coverPositionData,
    state.coverMintParams,
    state.tokenIn,
    state.tokenOut,
    state.needsRefetch,
    state.needsPosRefetch,
    state.claimTick,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setCoverPositionData,
    state.setTokenInCoverUSDPrice,
    state.setTokenOutCoverUSDPrice,
    state.setClaimTick,
    state.setGasFee,
    state.setGasLimit,
  ]);

  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();

  const router = useRouter();

  //cover aux
  const [priceDirection, setPriceDirection] = useState(false);
  const [fillPercent, setFillPercent] = useState(0);
  const [coverFilledAmount, setCoverFilledAmount] = useState("");
  const [allCoverPositions, setAllCoverPositions] = useState([]);

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

  const [lowerInverse, setLowerInverse] = useState(0);
  const [upperInverse, setUpperInverse] = useState(0);
  const [priceInverse, setPriceInverse] = useState(0);

  ////////////////////////////////Fetch Pool Data
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

  ////////////////////////////////Filled Amount

  const { data: filledAmount } = useContractRead({
    address: coverPoolAddress.toString(),
    abi: coverPoolABI,
    functionName: "snapshot",
    args: [
      [
        address,
        BigNumber.from("0"),
        BigNumber.from(coverPositionData.min),
        BigNumber.from(coverPositionData.max),
        BigNumber.from(claimTick),
        Boolean(coverPositionData.zeroForOne),
      ],
    ],
    chainId: 421613,
    watch: true,
    enabled:
      BigNumber.from(claimTick).lt(BigNumber.from("887272")) &&
      isConnected &&
      coverPoolAddress.toString() != "",
    onSuccess(data) {
      console.log("Success price filled amount", data);
    },
    onError(error) {
      console.log("Error price Cover", error);
      console.log(
        "claim tick snapshot args",
        address,
        BigNumber.from("0").toString(),
        coverPositionData.min.toString(),
        coverPositionData.max.toString(),
        claimTick.toString(),
        Boolean(coverPositionData.zeroForOne),
        router.isReady
      );
    },
    onSettled(data, error) {
      //console.log('Settled price Cover', { data, error })
    },
  });

  useEffect(() => {
    if (filledAmount) {
      setCoverFilledAmount(ethers.utils.formatUnits(filledAmount[2], tokenIn.decimals));
    }
  }, [filledAmount]);

  useEffect(() => {
    if (coverFilledAmount && coverPositionData.userFillIn) {
      setFillPercent(
        Number(coverFilledAmount) /
          Number(
            ethers.utils.formatUnits(
              coverPositionData.userFillIn.toString(),
              18
            )
          )
      );
    }
  }, [coverFilledAmount]);

  ////////////////////////////////Claim Tick

  useEffect(() => {
    setTimeout(() => {
      updateClaimTick();
    }, 3000);
  }, [claimTick]);

  async function updateClaimTick() {
    const aux = await getClaimTick(
      coverPoolAddress.toString(),
      Number(coverPositionData.min),
      Number(coverPositionData.max),
      Boolean(coverPositionData.zeroForOne),
      Number(coverPositionData.epochLast)
    );

    setClaimTick(aux);
    updateBurnFee(BigNumber.from(claimTick));
  }

  async function updateBurnFee(claim: BigNumber) {
    const newGasFee = await gasEstimateCoverBurn(
      coverPoolAddress.toString(),
      address,
      BN_ZERO,
      BigNumber.from(coverPositionData.min),
      claim,
      BigNumber.from(coverPositionData.max),
      Boolean(coverPositionData.zeroForOne),
      signer
    );

    setGasLimit(newGasFee.gasUnits);
    setGasFee(newGasFee.formattedPrice);
  }

  async function getUserCoverPositionData() {
    try {
      const data = await fetchCoverPositions(address)
      if (data['data'])
        setAllCoverPositions(
          mapUserCoverPositions(data['data'].positions),
        )
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      if (needsRefetch == true || needsPosRefetch == true) {
        getUserCoverPositionData()
        
        const positionId = coverPositionData.id
        const position = allCoverPositions.find((position) => position.id == positionId)
        console.log('new position', position)

      if(position != undefined) {
        setCoverPositionData(position)
      }

        setNeedsRefetch(false)
        setNeedsPosRefetch(false)
      }
    }, 5000)
  }, [needsRefetch, needsPosRefetch])
  

  ////////////////////////////////Addresses

  useEffect(() => {
    copyElementUseEffect(copyAddress0, setIs0Copied);
    copyElementUseEffect(copyAddress1, setIs1Copied);
    copyElementUseEffect(copyPoolAddress, setIsPoolCopied);
  });

  function copyAddress0() {
    navigator.clipboard.writeText(tokenIn.address.toString());
    setIs0Copied(true);
  }

  function copyAddress1() {
    navigator.clipboard.writeText(tokenOut.address.toString());
    setIs1Copied(true);
  }

  function copyPoolAddress() {
    navigator.clipboard.writeText(coverPoolAddress.toString());
    setIsPoolCopied(true);
  }

  ////////////////////////////////

  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen  ">
      <Navbar />
      <div className="flex justify-center w-full text-white relative min-h-[calc(100vh-76px)] w-full px-5">
        <div className="w-full lg:w-[60rem] mt-[10vh] mb-[10vh]">
          <div className="flex flex-wrap justify-between items-center mb-2">
            <div className="text-left flex flex-wrap gap-y-5 items-center gap-x-5 py-2.5">
              <div className="flex items-center">
                <img height="50" width="50" src={tokenIn.logoURI} />
                <img
                  height="50"
                  width="50"
                  className="ml-[-12px]"
                  src={tokenOut.logoURI}
                />
              </div>
              <span className="text-3xl flex items-center gap-x-3">
                {tokenIn.symbol} <ArrowLongRightIcon className="w-5 " />{" "}
                {tokenOut.symbol}
              </span>
              <div className="flex items-center">
                <span className="bg-white text-black rounded-md px-3 py-0.5">
                  {coverPositionData.feeTier / 10000}%
                </span>
              </div>
            </div>

            <a
              href={"https://goerli.arbiscan.io/address/" + coverPoolAddress}
              target="_blank"
              rel="noreferrer"
              className="gap-x-2 flex items-center text-white cursor-pointer hover:opacity-80"
            >
              View on Arbiscan
              <ArrowTopRightOnSquareIcon className="w-5 " />
            </a>
          </div>
          <div className="mb-4 w-full">
            <div className="flex flex-wrap justify-between text-[#646464] w-full">
              <div className="hidden md:grid grid-rows-2 md:grid-rows-1 grid-cols-1 md:grid-cols-2 gap-x-10 md:pl-2 pl-0 ">
                <h1
                  onClick={() => copyAddress0()}
                  className="text-xs cursor-pointer w-32"
                >
                  {tokenIn.symbol}:
                  {is0Copied ? (
                    <span className="ml-1">Copied</span>
                  ) : (
                    <span className="ml-1">{tokenZeroDisplay}</span>
                  )}
                </h1>
                <h1
                  onClick={() => copyAddress1()}
                  className="text-xs cursor-pointer"
                >
                  {tokenOut.symbol}:
                  {is1Copied ? (
                    <span className="ml-1">Copied</span>
                  ) : (
                    <span className="ml-1">{tokenOneDisplay}</span>
                  )}
                </h1>
              </div>
              <h1
                onClick={() => copyPoolAddress()}
                className="text-xs cursor-pointer flex items-center"
              >
                Pool:
                {isPoolCopied ? (
                  <span className="ml-1">Copied</span>
                ) : (
                  <span className="ml-1">{poolDisplay}</span>
                )}
              </h1>
            </div>
          </div>
          <div className="bg-black  border border-grey2 border-b-none w-full rounded-xl md:py-6 py-4 md:px-7 px-4 overflow-y-auto">
            <div className="flex md:flex-row flex-col gap-x-20 justify-between">
              <div className="md:w-1/2">
                <h1 className="text-lg mb-3">Cover Size</h1>
                <span className="text-4xl">
                  $
                  {(
                    Number(
                      ethers.utils.formatUnits(
                        coverPositionData.userFillOut.toString(),
                        18
                      )
                    ) * tokenIn.coverUSDPrice
                  ).toFixed(2)}
                </span>

                <div className="text-grey mt-3 space-y-2">
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img height="30" width="30" src={tokenIn.logoURI} />
                      {tokenIn.symbol}
                    </div>
                    {Number(
                      ethers.utils.formatUnits(
                        coverPositionData.userFillOut.toString(),
                        18
                      )
                    ).toFixed(2)}
                  </div>
                </div>
                <div className="mt-5 space-y-2 cursor-pointer">
                  <div
                    onClick={() => setIsAddOpen(true)}
                    className="bg-[#032851] w-full md:text-base text-sm py-3 px-4 rounded-xl"
                  >
                    Add Liquidity
                  </div>
                  <div
                    onClick={() => setIsRemoveOpen(true)}
                    className="bg-[#032851] w-full md:text-base text-sm py-3 px-4 rounded-xl"
                  >
                    Remove Liquidity
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 w-full">
                <h1 className="text-lg mb-3 mt-10 md:mt-0">Filled Position</h1>
                <span className="text-4xl">
                  ${" "}
                  {(Number(coverFilledAmount) * tokenIn.coverUSDPrice).toFixed(
                    2
                  )}
                  <span className="text-grey">
                    /$
                    {(
                      Number(
                        ethers.utils.formatUnits(
                          coverPositionData.userFillIn.toString(),
                          18
                        )
                      ) * tokenIn.coverUSDPrice
                    ).toFixed(2)}
                  </span>
                </span>
                <div className="text-grey mt-3">
                  <div className="flex items-center relative justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div
                      className={`absolute left-0 h-full w-[${fillPercent}%] bg-white rounded-l-xl opacity-10`}
                    />
                    <div className="flex items-center gap-x-4 z-20">
                      <img height="30" width="30" src={tokenOut.logoURI} />
                      {tokenOut.symbol}
                    </div>
                    <span className="text-white z-20">
                      {Number(coverFilledAmount).toFixed(2)}
                      <span className="text-grey">
                        /
                        {Number(
                          ethers.utils.formatUnits(
                            coverPositionData.userFillIn.toString(),
                            18
                          )
                        ).toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="space-y-3">
                    {/**TO-DO: PASS PROPS */}
                    <CoverCollectButton
                      poolAddress={coverPoolAddress}
                      address={address}
                      lower={BigNumber.from(coverPositionData.min)}
                      claim={BigNumber.from(claimTick)}
                      upper={BigNumber.from(coverPositionData.max)}
                      zeroForOne={Boolean(coverPositionData.zeroForOne)}
                      gasLimit={coverMintParams.gasLimit.mul(150).div(100)}
                      gasFee={coverMintParams.gasFee}
                    />
                    {/*TO-DO: add positionOwner ternary again*/}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-7">
              <div className="flex gap-x-6 items-center">
                <h1 className="text-lg">Price Range </h1>
                {parseFloat(
                  TickMath.getPriceStringAtTick(
                    Number(coverPositionData.latestTick)
                  )
                ) <
                  parseFloat(
                    TickMath.getPriceStringAtTick(Number(coverPositionData.min))
                  ) ||
                parseFloat(
                  TickMath.getPriceStringAtTick(
                    Number(coverPositionData.latestTick)
                  )
                ) >=
                  parseFloat(
                    TickMath.getPriceStringAtTick(Number(coverPositionData.max))
                  ) ? (
                  <div className="pr-5">
                    <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm whitespace-nowrap">
                      <ExclamationTriangleIcon className="w-4 text-yellow-600" />
                      Out of Range
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm whitespace-nowrap">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    In Range
                  </div>
                )}
              </div>
              <button
                onClick={() => setPriceDirection(!priceDirection)}
                className="text-grey text-xs bg-dark border border-grey1 cursor-pointer px-4 py-1 rounded-md whitespace-nowrap text-xs text-grey flex items-center gap-x-2"
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
                <ArrowsRightLeftIcon className="w-4 text-white" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-4 md:gap-x-6 gap-x-3">
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey md:text-xs text-[10px] w-full">
                  Min. Price
                </div>
                <div className="text-white text-2xl my-2 w-full">
                  {coverPositionData.min === undefined
                    ? ""
                    : priceDirection
                    ? lowerInverse
                    : TickMath.getPriceStringAtTick(
                        Number(coverPositionData.min)
                      )}
                </div>
                <div className="text-grey md:text-xs text-[10px] w-full">
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
                </div>
                <div className="text-grey md:text-xs text-[10px] w-full italic mt-1">
                  Your position will be 100%{" "}
                  {Boolean(coverPositionData.zeroForOne)
                    ? priceDirection
                      ? tokenIn.symbol
                      : tokenOut.symbol
                    : priceDirection
                    ? tokenOut.symbol
                    : tokenIn.symbol}{" "}
                  at this price.
                </div>
              </div>
              <ArrowsRightLeftIcon className="w-12 text-grey" />
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey md:text-xs text-[10px] w-full">
                  Max. Price
                </div>
                <div className="text-white text-2xl my-2 w-full">
                  {coverPositionData.max === undefined
                    ? ""
                    : priceDirection
                    ? upperInverse
                    : TickMath.getPriceStringAtTick(
                        Number(coverPositionData.max)
                      )}
                </div>
                <div className="text-grey md:text-xs text-[10px] w-full">
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
                </div>
                <div className="text-grey md:text-xs text-[10px] w-full italic mt-1">
                  Your position will be 100%{" "}
                  {Boolean(coverPositionData.zeroForOne)
                    ? priceDirection
                      ? tokenOut.symbol
                      : tokenIn.symbol
                    : priceDirection
                    ? tokenIn.symbol
                    : tokenOut.symbol}{" "}
                  at this price.
                </div>
              </div>
            </div>
            <div className="border border-grey1 rounded-xl py-2 text-center w-full mt-4 bg-dark">
              <div className="text-grey text-xs w-full">Current Price</div>
              <div className="text-white text-2xl my-2 w-full">
                {priceDirection
                  ? priceInverse
                  : TickMath.getPriceStringAtTick(
                      Number(coverPositionData.latestTick)
                    )}
              </div>
              <div className="text-grey text-xs w-full">
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
              </div>
            </div>
          </div>
        </div>
        {tokenIn.name == "" ? (
          <></>
        ) : (
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
        )}
      </div>
    </div>
  );
}
