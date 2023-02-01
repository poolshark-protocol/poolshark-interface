import { Fragment, useState, useEffect } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { Transition, Dialog } from "@headlessui/react";
import useTokenList from "../hooks/useTokenList";
import CoinListButton from "./Buttons/CoinListButton";
import CoinListItem from "./CoinListItem";
  
export default function SelectToken(props) {

  const [inputVal, setInputVal] = useState("")
  const [coins] = useTokenList();
  const [coinsForListing, setCoinsForListing] = useState(coins.slice(0, 20))

  const findCoin = () => {
      if (inputVal.length === 0) {
          setCoinsForListing(coins.slice(0, 20))
      } else {
          if (inputVal.length === 42 && inputVal.substring(0, 2) === "0x") {
              let searchedCoin = coins.find(token => token.id === inputVal)
              if (searchedCoin != undefined) {
                  setCoinsForListing([searchedCoin])
              }
          } else {
              let searchedCoins = coins.filter(coin => coin.name.toUpperCase().includes(inputVal.toUpperCase()) || coin.symbol.toUpperCase().includes(inputVal.toUpperCase()))
              if (searchedCoins.length > 20) {
                  searchedCoins = searchedCoins.slice(0, 20)
              }
              setCoinsForListing(searchedCoins)
          }
      }
  }
  const chooseToken = (e) => {
      const coin = e.target.dataset 
      props.chooseCoin({
          name:coin.name, 
          address:coin.address, 
          symbol: coin.symbol, 
          logoURI:coin.logouri, 
          decimals:coin.decimals
      })
      close()
  }
  const close = () => {
      props.onClose()
  }
  useEffect(() => {
      findCoin()
  }, [inputVal]);
  
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

    return (
        <div>
                            <Transition appear show={isOpen} as={Fragment}>
                    <Dialog
                      as="div"
                      className="relative z-50"
                      onClose={closeModal}
                    >
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
                                  className="border border-grey2 bg-dark outline-none py-2.5 pl-12 rounded-lg w-full placeholder:text-grey placeholder:font-regular text-white"
                                  placeholder="Search name or paste address"
                                  value={inputVal}
                                  onChange={e => setInputVal(e.target.value)}
                                ></input>
                                <div className="flex justify-between flex-wrap mt-4 gap-y-2">
                                  {coinsForListing != null && coinsForListing.map((coin, index) => {
                                  return (
                                    index < 4 && <CoinListButton chooseToken={chooseToken} coin={coin} key={coin.id} />
                                )
                                })}
                                </div>
                              </div>
                              <div>
                                {coinsForListing != null && coinsForListing.map((coin) => {
                                  return (
                                  <CoinListItem chooseToken={chooseToken} coin={coin} key={coin.id} />
                                  )
                              })}
                                {(coinsForListing === null || coinsForListing.length === 0) &&
                                <div>No coin</div>
                                }
                              </div>
                            </Dialog.Panel>
                          </Transition.Child>
                        </div>
                      </div>
                    </Dialog>
                  </Transition>
                  <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
                  >
                    <div className="flex items-center gap-x-2 w-full">
                      <img className="w-7" src="/static/images/token.png" />
                      USDC
                    </div>
                    <ChevronDownIcon className="w-5" />
                  </button>
        </div>
      );
    }