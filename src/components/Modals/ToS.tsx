import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useState, useEffect, useRef } from "react";

export default function TermsOfService({
  onAccept,
  isOpen,
  setIsOpen,
  read = false,
}) {
  const [isButtonEnabled, setButtonEnabled] = useState(false);

  const modalRef = useRef(null);

  const handleScroll = () => {
    const modal = modalRef.current;
    if (modal) {
      const isScrolledToBottom =
        modal.scrollHeight - modal.scrollTop === modal.clientHeight;
      setButtonEnabled(isScrolledToBottom);
    }
  };

  useEffect(() => {
    const modal = modalRef.current;
    if (modal) {
      modal.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (modal) {
        modal.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={read ? () => setIsOpen(false) : () => setIsOpen(true)}
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
          <div className="fixed inset-0 bg-black bg-opacity-60" />
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
              <Dialog.Panel className="w-full max-w-[500px] transform overflow-hidden rounded-xl bg-black text-white border border-grey2 text-left align-middle shadow-xl px-5 py-5 transition-all">
                <div className="pb-3">
                  <h1>Terms of Service</h1>
                  {!read && (
                    <h2 className="text-sm text-grey1">
                      Please accept these terms before using our services.
                    </h2>
                  )}
                </div>
                <div
                  ref={modalRef}
                  className="h-[400px] overflow-y-scroll terms"
                >
                  <div className="mt-2">
                    <h1 className="text-sm">APYs being indicative</h1>
                    <p className="text-xs mt-1 text-white/60">
                      All APYs listed on this site are for guidance purposes
                      only. Poolshark employs strategies across a broad range of
                      markets. The available liquidity in said markets changes
                      constantly. As a result, Poolshark cannot calculate APYs
                      in real time. Users acknowledge this and also acknowledge
                      the risk of negative returns on their deposited funds
                      during certain time periods. By depositing funds in
                      Poolshark&apos;s vaults, the user assumes any associated
                      risk of loss.
                    </p>
                  </div>
                  <div className="mt-5">
                    <h1 className="text-sm">
                      Risk of loss of funds when using our products
                    </h1>
                    <p className="text-xs mt-1 text-white/60">
                      Our products are a smart contracts based suite of
                      technologies that relies on blockchain technology. By
                      depositing your funds into our vaults you recognize and
                      assume all risks inherent in such technologies, including
                      but not limited to the risk that the smart contracts
                      underlying our vaults could fail, resulting in a total
                      loss of user funds. Poolshark is not responsible for any
                      such losses.
                    </p>
                  </div>
                  <div className="mt-5">
                    <h1 className="text-sm">
                      UI usage and legal jurisdictions
                    </h1>
                    <p className="text-xs mt-1 text-white/60">
                      Our Interface is NOT offered to persons or entities who
                      reside in, are citizens of, are incorporated in, or have a
                      registered office in the United States of America or any
                      Prohibited Localities. Poolshark is a decentralized
                      finance project and does not hold any securities licenses
                      in the U.S. or any other jurisdiction. Any investment made
                      through our protocol shall be made with this in mind.
                    </p>
                  </div>
                  <div className="mt-5">
                    <p className="text-xs mt-1 text-white/60">
                      Furthermore, by accepting these terms you acknowledge and
                      warrant that you are not a citizen of or otherwise
                      accessing the website from the following nations or
                      geographical locations: Democratic Republic of Congo, Cote
                      D&apos;Ivoire (Ivory Coast), China, Cuba, Hong Kong,
                      India, Iraq, Iran, Democratic People&apos;s Republic of
                      Korea (North Korea), Libya, Mali, Myanmar (Burma),
                      Nicaragua, Sudan, Somalia, Syria, Yemen, Zimbabwe, and/or
                      any other jurisdiction prohibited by the United States
                      Office of Foreign Asset Control (OFAC).
                    </p>
                  </div>
                </div>
                {!read && (
                  <div className="flex items-center justify-end w-full">
                    <button
                      className="bg-main1 px-12 py-2 rounded-full border border-main text-sm mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={onAccept}
                    >
                      Accept Terms
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
