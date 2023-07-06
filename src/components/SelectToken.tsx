import { Fragment, useState, useEffect } from 'react'
import {
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid'
import { Transition, Dialog } from '@headlessui/react'
import {
  tokenZeroAddress,
  tokenOneAddress,
} from '../constants/contractAddresses'
import useTokenList from '../hooks/useTokenList'
import CoinListButton from './Buttons/CoinListButton'
import CoinListItem from './CoinListItem'

export default function SelectToken(props) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const coins = useTokenList()[0]

  //@dev this is temporary for testnet
  // const [rawCoinList, setRawCoinList] = useState(coins["listed_tokens"]);
  const [rawCoinList, setRawCoinList] = useState([
    {
      name: 'WETH',
      address: tokenOneAddress,
      symbol: 'WETH',
      logoURI: '/static/images/eth_icon.png',
      decimals: 18,
    },
    {
      name: 'USDC',
      address: tokenZeroAddress,
      symbol: 'USDC',
      logoURI: '/static/images/token.png',
      decimals: 18,
    },
  ])

  const [orderedCoinList, setOrderedCoinList]= useState([])

  //@dev this is temporary for testnet
  // const findCoin = () => {
  //   if (inputVal.length === 0) {
  //     setRawCoinList(coins["listed_tokens"]);
  //   } else {
  //     if (inputVal.length === 42 && inputVal.substring(0, 2) === "0x") {
  //       let searchedCoin = coins["search_tokens"].find(
  //         (token) => token.id === inputVal
  //       );
  //       if (searchedCoin != undefined) {
  //         setRawCoinList(searchedCoin);
  //       }
  //     } else {
  //       let searchedCoins = coins["search_tokens"].filter(
  //         (coin) =>
  //           coin.name.toUpperCase().includes(inputVal.toUpperCase()) ||
  //           coin.symbol.toUpperCase().includes(inputVal.toUpperCase())
  //       );
  //       if (searchedCoins.length > 20) {
  //         searchedCoins = searchedCoins.slice(0, 20);
  //       }
  //       setRawCoinList(searchedCoins);
  //     }
  //   }
  // };

  const chooseToken = (coin) => {
    coin = {
      name: coin?.name,
      address: coin?.address, //@dev use id for address in production like so address: coin?.id because thats what coin [] will have instead of address
      symbol: coin?.symbol,
      logoURI: coin?.logoURI,
      decimals: coin?.decimals,
    }
    if (props.type === 'in') {
      if (coin.symbol === props.tokenOut.symbol) {
        if (props.selected === true) {
          props.setTokenOut(props.tokenIn)
          props.setQueryTokenOut(props.queryTokenIn)
          props.setHasSelected(true)
        } else {
          props.setTokenOut({
            symbol: 'Select Token',
            logoURI: '',
            address: tokenOneAddress,
            usdPrice: 0,
          })
          props.setHasSelected(false)
        }
        props.setQueryTokenIn(props.queryTokenOut)
      } else {
        if (coin.address.localeCompare(props.tokenOut.address) < 0) {
          props.setTokenIn(coin)
          if (props.selected === true) {
            props.setTokenOut(props.tokenOut)
          }
        }
        if (coin.address.localeCompare(props.tokenOut.address) >= 0) {
          if (props.selected === true) {
            props.setTokenIn(props.tokenOut)
          }
        }
        props.setHasSelected(true)
      }
      props.setTokenIn(coin)
    } else {
      if (coin.symbol === props.tokenIn.symbol) {
        if (props.selected === true) {
          props.setTokenIn(props.tokenOut)
          props.setQueryTokenIn(props.queryTokenOut)
          props.setHasSelected(true)
        } else {
          props.setTokenIn({
            symbol: 'Select Token',
            logoURI: '',
            address: tokenZeroAddress,
            usdPrice: 0,
          })
          props.setHasSelected(false)
        }
        props.setQueryTokenOut(props.queryTokenIn)
      } else {
        if (coin.address.localeCompare(props.tokenIn.address) < 0) {
          props.setTokenIn(coin)
          props.setTokenOut(props.tokenIn)
        }

        if (coin.address.localeCompare(props.tokenIn.address) >= 0) {
          props.setTokenIn(props.tokenIn)
          props.setTokenOut(coin)
        }
        props.setHasSelected(true)
      }
      props.setTokenOut(coin)
    }
    props.balance(coin?.id)
    closeModal()
  }

  useEffect(() => {
    //@dev this is temporary for testnet
    // findCoin();
  }, [inputVal, isOpen])

  //   useEffect(() => {
  // }, [rawCoinList]);

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <div className="w-full">
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-black border border-grey2 text-left align-middle shadow-xl transition-all">
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-white">Select Token</h1>
                      <XMarkIcon
                        onClick={() => setIsOpen(false)}
                        className="w-6 text-white cursor-pointer"
                      />
                    </div>
                    <MagnifyingGlassIcon className="w-5 text-white absolute mt-[13px] ml-[14px] text-grey" />
                    <input
                      autoComplete="off"
                      className="border border-grey2 bg-dark outline-none py-2.5 pl-12 rounded-lg w-full placeholder:text-grey placeholder:font-regular text-white md:text-base text-sm"
                      placeholder="Search name or paste address"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                    ></input>
                    <div className="flex justify-between flex-wrap mt-4 gap-y-2">
                      {rawCoinList?.map((coin) => {
                        return (
                          <CoinListButton
                            key={coin.symbol + 'top'}
                            coin={coin}
                            chooseToken={chooseToken}
                          />
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    {rawCoinList?.map((coin) => {
                      return (
                        <CoinListItem
                          key={coin.symbol}
                          coin={coin}
                          chooseToken={chooseToken}
                        />
                      )
                    })}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <button
        onClick={() => openModal()}
        className={
          (props.tokenIn.symbol != 'Select Token' && props.type == 'in') ||
          (props.tokenOut.symbol != 'Select Token' && props.type == 'out')
            ? 'w-full md:text-base text-sm whitespace-nowrap flex items-center uppercase gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl'
            : 'w-full md:text-base text-sm whitespace-nowrap flex items-center bg-background text-main gap-x-1 md:gap-x-3 hover:opacity-80  md:px-4 px-3 py-2 rounded-xl'
        }
      >
        <div className="flex items-center gap-x-2 w-full">
          {(props.tokenIn.symbol != 'Select Token' && props.type == 'in') ||
          (props.tokenOut.symbol != 'Select Token' && props.type == 'out') ? (
            <img className="md:w-7 w-6" src={props.displayToken?.logoURI} />
          ) : (
            <></>
          )}
          {props.displayToken?.symbol}
        </div>
        <ChevronDownIcon className="w-5" />
      </button>
    </div>
  )
}
