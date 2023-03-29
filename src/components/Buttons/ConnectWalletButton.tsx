import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import Network from "../Modals/Network";
import { useState} from "react";
import React from "react";


export const ConnectWalletButton = () => {

  const [isOpen, setIsOpen] = useState(false);

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
                    className="w-full py-2.5 text-sm mx-auto text-white px-8 font-DMSans text-center transition rounded-lg cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <>
                  <button onClick={() => setIsOpen(true)} type="button" className="w-full flex gap-x-2 items-center py-2.5 text-sm mx-auto text-white px-5 font-DMSans text-center transition rounded-lg cursor-pointer bg-black border border-red-500 hover:opacity-80"
>
                    Wrong network
                    <ChevronDownIcon className="w-5" />
                  </button>
</>

                );
              }
              return (
                <>
                <div className="flex text-white gap-x-4">
                  <button
                    onClick={() => setIsOpen(true)}
                    style={{ display: "flex", alignItems: "center" }}
                    type="button"
                    className="bg-black border-grey1 border rounded-lg py-2 px-4 gap-x-2 hover:opacity-80"
                  >
                    {chain.hasIcon && (
                      <div
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                     {chain.id === 421613 ? <img  style={{ width: 16, height: 16 }} src="/static/images/arb_icon.svg" /> : ""}
                    {chain.name}
                  </button>
                  <button onClick={openAccountModal} type="button" className="flex bg-dark rounded-lg border-grey1 border hover:opacity-80">
                    {account.displayBalance
                      ?
                    <div className="bg-dark py-2 px-4 rounded-l-lg">
                        {account.displayBalance}
                    </div> : ""}
                    <div className="bg-black flex gap-x-2 rounded-lg border-grey1 border mt-[-1px] mr-[-1px] mb-[-1px] ">
                    <div className="py-2 pl-5 pr-3">
                      {account.displayName}
                    </div>
                    <div className="border-l border-grey1 py-2.5 px-3">
                    <ChevronDownIcon className="w-5"/>
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
