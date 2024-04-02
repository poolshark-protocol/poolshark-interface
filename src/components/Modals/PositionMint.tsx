import { Transition, Dialog } from "@headlessui/react";
import Link from "next/link";
import router, { useRouter } from "next/router";
import { Fragment, useState, useEffect } from "react";
import Loader from "../Icons/Loader";
import { chainProperties } from "../../utils/chains";
import { useConfigStore } from "../../hooks/useConfigStore";

export default function PositionMintModal({
  errorDisplay,
  hash,
  isLoading,
  successDisplay,
  type,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonWait, setButtonWait] = useState(false);

  const networkName = useConfigStore((state) => state.networkName);

  useEffect(() => {
    if (errorDisplay || isLoading || successDisplay) {
      setIsOpen(true);
    }
  }, [successDisplay, isLoading, errorDisplay]);

  useEffect(() => {
    if (successDisplay) {
      setButtonWait(true);
      setTimeout(() => {
        setButtonWait(false);
      }, 1000);
    }
  }, [successDisplay, isLoading, errorDisplay]);

  const router = useRouter();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
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
              <Dialog.Panel className="w-full max-w-[300px] transform overflow-hidden rounded-xl bg-black text-white border border-grey2 text-left align-middle shadow-xl px-5 py-5 transition-all">
                {isLoading ? (
                  <svg
                    aria-hidden="true"
                    className="mx-auto w-[100px] h-[100px] text-grey/50 animate-spin fill-main"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                ) : successDisplay ? (
                  <svg
                    width="100"
                    height="100"
                    viewBox="0 0 100 100"
                    className="mx-auto"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="50"
                      cy="50.1528"
                      r="47.0122"
                      fill="#091910"
                      stroke="#2ECC71"
                      strokeWidth="5"
                    />
                    <path
                      d="M38.5254 51.3256L47.7051 60.7048L61.4746 39.6016"
                      stroke="#2ECC71"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  errorDisplay && (
                    <svg
                      width="100"
                      height="100"
                      viewBox="0 0 100 100"
                      fill="none"
                      className="mx-auto"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="50"
                        cy="50.1528"
                        r="47.0122"
                        fill="#1C0B0A"
                        stroke="#E74C3C"
                        strokeWidth="5"
                      />
                      <path
                        d="M41.4441 39.0059C41.1171 38.7012 40.6846 38.5354 40.2377 38.5432C39.7908 38.5511 39.3644 38.7322 39.0483 39.0482C38.7323 39.3643 38.5512 39.7906 38.5434 40.2375C38.5355 40.6844 38.7014 41.1169 39.0061 41.4439L47.5621 49.9999L39.0061 58.5559C38.8366 58.7139 38.7006 58.9043 38.6064 59.1159C38.5121 59.3275 38.4614 59.5559 38.4573 59.7875C38.4532 60.0192 38.4958 60.2492 38.5826 60.464C38.6693 60.6788 38.7985 60.8739 38.9623 61.0377C39.1261 61.2015 39.3212 61.3307 39.536 61.4174C39.7508 61.5042 39.9808 61.5468 40.2125 61.5427C40.4441 61.5386 40.6725 61.4879 40.8841 61.3936C41.0957 61.2994 41.2861 61.1634 41.4441 60.9939L50.0001 52.4379L58.5561 60.9939C58.714 61.1634 58.9044 61.2994 59.116 61.3936C59.3276 61.4879 59.556 61.5386 59.7877 61.5427C60.0193 61.5468 60.2493 61.5042 60.4641 61.4174C60.6789 61.3307 60.874 61.2015 61.0378 61.0377C61.2017 60.8739 61.3308 60.6788 61.4175 60.464C61.5043 60.2492 61.5469 60.0192 61.5428 59.7875C61.5387 59.5559 61.488 59.3275 61.3938 59.1159C61.2995 58.9043 61.1635 58.7139 60.9941 58.5559L52.4381 49.9999L60.9941 41.4439C61.2988 41.1169 61.4646 40.6844 61.4568 40.2375C61.4489 39.7906 61.2678 39.3643 60.9518 39.0482C60.6357 38.7322 60.2094 38.5511 59.7625 38.5432C59.3156 38.5354 58.8831 38.7012 58.5561 39.0059L50.0001 47.5619L41.4441 39.0059Z"
                        fill="#E74C3C"
                      />
                    </svg>
                  )
                )}

                <h1 className="text-center text-sm mt-5 ">
                  {isLoading
                    ? "Your position is being created..."
                    : successDisplay
                    ? "Your position has been created succesfully!"
                    : errorDisplay &&
                      "Your position was not able to be created"}
                </h1>
                <div
                  className={`flex flex-col items-center justify-center mt-12 gap-3 ${
                    isLoading && "opacity-20 cursor-not-allowed"
                  }`}
                >
                  <a href={type === "range" ? "/range" : "/cover"}>
                    <button
                      disabled={buttonWait}
                      className="disabled:opacity-50 whitespace-nowrap text-xs flex items-center gap-x-2 text-grey1 hover:text-white hover:underline transition-all"
                    >
                      {buttonWait ? (
                        <div className="my-0.5 flex items-center gap-x-2">
                          <Loader /> Loading...
                        </div>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
                            />
                          </svg>
                          Go back
                        </>
                      )}
                    </button>
                  </a>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`${chainProperties[networkName]["explorerUrl"]}/tx/${hash}`}
                    className="whitespace-nowrap text-xs flex items-center gap-x-2 text-blue-500 hover:underline"
                  >
                    View on block explorer
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-4 h-4 -mt-0.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
