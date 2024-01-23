import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Network from "../Modals/Network";
import { useState, useEffect } from "react";
import React from "react";
import ChainImage from "./ChainImage";

interface Props {
  xl?: boolean;
  center?: boolean;
}

export const ConnectWalletButton = ({ xl = false, center = false }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  useEffect(() => {
    // Check if terms of service is accepted
    const isTosAccepted = localStorage.getItem("tosAccepted") === "true";
    setTosAccepted(isTosAccepted);

    // Simulate wallet connection logic
    // In real scenario, this will be replaced with actual wallet connection logic
    // setWalletConnected(true/false) based on wallet connection status
  }, []);

  const handleTosAccept = () => {
    localStorage.setItem("tosAccepted", "true");
    setTosAccepted(true);
  };

  return (
    <>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated");
          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      className={`w-full mx-auto text-white uppercase px-8  text-center transition cursor-pointer bg-main1 border border-main hover:opacity-80 ${
                        xl ? `py-4 ` : `py-2.5 text-sm`
                      }`}
                      onClick={openConnectModal}
                      type="button"
                    >
                      Connect Wallet
                    </button>
                  );
                }
                if (chain.unsupported && chain.id != 11155111) {
                  return (
                    <>
                      <button
                        onClick={() => setIsOpen(true)}
                        type="button"
                        className="w-full flex gap-x-2 items-center py-2.5 text-sm mx-auto text-white px-5  text-center transition rounded-[4px] uppercase cursor-pointer bg-black border border-red-500 hover:opacity-80"
                      >
                        Wrong network
                        <ChevronDownIcon className="w-5" />
                      </button>
                    </>
                  );
                }
                return (
                  <>
                    <div
                      className={`flex w-full flex-row  items-end  justify-end gap-y-4 text-white gap-x-4 ${
                        center ? `justify-center` : ``
                      }`}
                    >
                      <button
                        onClick={() => setIsOpen(true)}
                        type="button"
                        className="bg-black border-grey border rounded-[4px] h-[42px] w-[35px] flex justify-center items-center md:w-auto h-[42px] md:px-4 px-2 gap-x-2 hover:opacity-80"
                      >
                        {/*
                        {chain.hasIcon && (
                          <div>
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                style={{ width: 16, height: 16 }}
                              />
                            )}
                          </div>
                        )}
                        */}
                        {<ChainImage
                          chainId={chain?.id}
                        />}
                      </button>
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="flex bg-dark rounded-[4px] 2xl:border-grey border-transparent border hover:opacity-80 "
                      >
                        {account.displayBalance ? (
                          <div className="bg-dark py-2.5 px-4 rounded-l-lg whitespace-nowrap hidden 2xl:block text-sm flex items-center">
                            <span>{account.displayBalance}</span>
                          </div>
                        ) : (
                          ""
                        )}
                        <div className="bg-black flex gap-x-2 rounded-[4px] border-grey border mt-[-1px] mr-[-1px] mb-[-1px] ">
                          <div className="py-2 pl-5 lg:pr-3 pr-5 whitespace-nowrap">
                            {account.displayName}
                          </div>
                          <div className="border-l border-grey lg:block hidden py-2.5 px-3">
                            <ChevronDownIcon className="w-5" />
                          </div>
                        </div>
                      </button>
                    </div>
                  </>
                );
              })()}
              <Network
                isOpen={isOpen}
                chainUnsupported={chain?.unsupported}
                setIsOpen={setIsOpen}
                chainId={chain?.id}
              />
            </div>
          );
        }}
      </ConnectButton.Custom>
    </>
  );
};
