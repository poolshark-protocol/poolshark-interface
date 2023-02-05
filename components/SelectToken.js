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
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const coins = useTokenList()[0];
  const [coinsForListing, setCoinsForListing] = useState(coins.listed_tokens);

  const findCoin = () => {
    if (inputVal.length === 0) {
      setCoinsForListing(coins.listed_tokens);
    } else {
      if (inputVal.length === 42 && inputVal.substring(0, 2) === "0x") {
        let searchedCoin = coins.search_tokens.find(
          (token) => token.id === inputVal
        );
        if (searchedCoin != undefined) {
          setCoinsForListing(searchedCoin);
        }
      } else {
        let searchedCoins = coins.search_tokens.filter(
          (coin) =>
            coin.name.toUpperCase().includes(inputVal.toUpperCase()) ||
            coin.symbol.toUpperCase().includes(inputVal.toUpperCase())
        );
        if (searchedCoins.length > 20) {
          searchedCoins = searchedCoins.slice(0, 20);
        }
        setCoinsForListing(searchedCoins);
      }
    }
  };
  const chooseToken = (coin) => {
    props.tokenChosen({
      name: coin?.name,
      address: coin?.id,
      symbol: coin?.symbol,
      logoURI: coin?.logoURI,
      decimals: coin?.decimals,
    })
    closeModal();
  };

  useEffect(() => {
    findCoin();
  }, [inputVal, isOpen]);

  //   useEffect(() => {
  // }, [coinsForListing]);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <div>
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
                      className="border border-grey2 bg-dark outline-none py-2.5 pl-12 rounded-lg w-full placeholder:text-grey placeholder:font-regular text-white"
                      placeholder="Search name or paste address"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                    ></input>
                    <div className="flex justify-between flex-wrap mt-4 gap-y-2">
                      {coinsForListing?.map((coin, index) => {
                        return <CoinListButton coin={coin} />;
                      })}
                    </div>
                  </div>
                  <div>
                    {coinsForListing?.map((coin) => {
                      return (
                        <CoinListItem coin={coin} chooseToken={chooseToken} />
                      );
                    })}
                    {/* {(coinsForListing === null || coinsForListing.length === 0) &&
                                <div>No coin</div>
                                } */}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <button
        onClick={() => openModal()}
        className="flex items-center gap-x-3 bg-black border border-grey1 px-2 py-1.5 rounded-xl"
      >
        <div className="flex items-center gap-x-2 w-full">
          <img className="w-7" src={props.displayToken?.logoURI} />
          {props.displayToken?.symbol?.toUpperCase()}
        </div>
        <ChevronDownIcon className="w-5" />
      </button>
    </div>
  );
}
