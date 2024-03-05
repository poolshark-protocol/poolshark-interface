import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { ConnectWalletButton } from "./Buttons/ConnectWalletButton";
import Trade from "./Icons/TradeIcon";
import Range from "./Icons/RangeIcon";
import { useConfigStore } from "../hooks/useConfigStore";

interface NavOptions {
  create?: boolean;
  setCreate?;
}

export default function Navbar({ create, setCreate }: NavOptions) {
  const router = useRouter();

  const [chainId] = useConfigStore((state) => [state.chainId]);

  return (
    <div className="py-2 mx-auto w-full border-b border-grey">
      <div className="relative flex items-center justify-between h-16 w-full container mx-auto md:px-0 px-3">
        <div className="xl:grid flex justify-between items-center grid-cols-3 w-full mx-auto">
          <div className="flex items-center justify-start flex-shrink-0">
            <Link href="/">
              <div className="flex items-center">
                <Image
                  src="https://poolshark-token-lists.s3.amazonaws.com/images/logo.png"
                  width={70}
                  height={70}
                  quality="90"
                  objectFit="contain"
                  alt="Poolshark logo"
                />
              </div>
            </Link>
          </div>
          <div className="hidden w-full ml-2 lg:ml-4 xl:ml-0 flex justify-start md:block bg-black">
            <div className="flex md:gap-x-1 gap-x-2 justify-center">
              <Link href="/">
                <div
                  className={
                    router.pathname == "/" || router.pathname.includes("/limit")
                      ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-5 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]"
                      : "text-grey1 border border-transparent transition-all py-1.5 px-5 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]"
                  }
                >
                  <Trade />
                  TRADE
                </div>
              </Link>
              <Link href="/range">
                <div
                  className={
                    router.pathname.includes("/range")
                      ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]"
                      : "text-grey1 border border-transparent transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-1.5 text-[13px]"
                  }
                >
                  <Range />
                  RANGE
                </div>
              </Link>
              {/* <Link href="/cover"> 
              <div
                className={
                  router.pathname.includes("/cover")
                    ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]"
                    : "text-grey1 border border-transparent transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]"
                }
              >
                <Cover />
                COVER
              </div>
               </Link> */}
              {chainId === 42161 && (
                <Link href="/bond">
                  <div
                    className={
                      router.pathname.includes("/bond")
                        ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]"
                        : "text-grey1 border border-transparent transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]"
                    }
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 512 512"
                      height="1.25em"
                      width="1.25em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2l0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5V176c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336V300.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4V304v5.7V336zm32 0V304 278.1c19-4.2 36.5-9.5 52.1-16c16.3-6.8 31.5-15.2 43.9-25.5V272c0 10.5-5 21-14.9 30.9c-16.3 16.3-45 29.7-81.3 38.4c.1-1.7 .2-3.5 .2-5.3zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5V432c0 44.2-86 80-192 80S0 476.2 0 432V396.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"></path>
                    </svg>
                    BOND
                  </div>
                </Link>
              )}
              {chainId === 34443 || chainId === 42161 || chainId === 534352 && (
                <Link href="/earn">
                  <div
                    className={
                      router.pathname.includes("/earn")
                        ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]"
                        : "text-grey1 border border-transparent transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]"
                    }
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 16 16"
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                      <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"></path>
                    </svg>
                    EARN
                  </div>
                </Link>
              )}
              {(chainId === 34443 || chainId == 421614) && (
                <Link href="/sale">
                  <div
                    className={
                      router.pathname.includes("/sale")
                        ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]"
                        : "text-grey1 border border-transparent transition-all py-1.5 px-5 md:px-4 text-sm flex items-center cursor-pointer gap-x-2 text-[13px]"
                    }
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 512 512"
                      height="1.25em"
                      width="1.25em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2l0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5V176c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336V300.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4V304v5.7V336zm32 0V304 278.1c19-4.2 36.5-9.5 52.1-16c16.3-6.8 31.5-15.2 43.9-25.5V272c0 10.5-5 21-14.9 30.9c-16.3 16.3-45 29.7-81.3 38.4c.1-1.7 .2-3.5 .2-5.3zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5V432c0 44.2-86 80-192 80S0 476.2 0 432V396.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"></path>
                    </svg>
                    SALE
                  </div>
                </Link>
              )}
            </div>
          </div>
          <div className="w-full flex justify-end items-center gap-x-4">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full md:hidden z-50 ">
        <div className="m-auto border-t flex w-full justify-center border-grey shadow-lg p-[10px] bg-black">
          <div className="flex">
            <Link href="/">
              <div
                className={
                  router.pathname == "/"
                    ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-0.5 text-[11px]"
                    : "text-grey1 border border-transparent transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-0.5 text-[11px]"
                }
              >
                <Trade />
                TRADE
              </div>
            </Link>
            <Link href="/range">
              <div
                className={
                  router.pathname.includes("/range")
                    ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-0.5 text-[11px]"
                    : "text-grey1 border border-transparent transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-0.5 text-[11px]"
                }
              >
                <Range />
                RANGE
              </div>
            </Link>
            {chainId === 34443 && (
              <Link href="/sale">
                <div
                  className={
                    router.pathname.includes("/sale")
                      ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-1 text-[11px]"
                      : "text-grey1 border border-transparent transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-1 text-[11px]"
                  }
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 512 512"
                    height="1.4em"
                    width="1.4em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2l0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5V176c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336V300.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4V304v5.7V336zm32 0V304 278.1c19-4.2 36.5-9.5 52.1-16c16.3-6.8 31.5-15.2 43.9-25.5V272c0 10.5-5 21-14.9 30.9c-16.3 16.3-45 29.7-81.3 38.4c.1-1.7 .2-3.5 .2-5.3zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5V432c0 44.2-86 80-192 80S0 476.2 0 432V396.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"></path>
                  </svg>
                  SALE
                </div>
              </Link>
            )}
            {/* <Link href="/cover">
            <div
              className={
                router.pathname.includes("/cover")
                  ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-1 text-[11px]"
                  : "text-grey1 border border-transparent transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-1 text-[11px]"
              }
            >
              <Cover />
              COVER
            </div>
            </Link> */}
            {chainId === 42161 && (
              <Link href="/bond">
                <div
                  className={
                    router.pathname.includes("/bond")
                      ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-1 text-[11px]"
                      : "text-grey1 border border-transparent transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-1 text-[11px]"
                  }
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 512 512"
                    height="1.4em"
                    width="1.4em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2l0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5V176c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336V300.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4V304v5.7V336zm32 0V304 278.1c19-4.2 36.5-9.5 52.1-16c16.3-6.8 31.5-15.2 43.9-25.5V272c0 10.5-5 21-14.9 30.9c-16.3 16.3-45 29.7-81.3 38.4c.1-1.7 .2-3.5 .2-5.3zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5V432c0 44.2-86 80-192 80S0 476.2 0 432V396.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"></path>
                  </svg>
                  BOND
                </div>
              </Link>
            )}
            {chainId === 34443 || chainId === 42161 || chainId === 534352 ? (
              <Link href="/earn">
                <div
                  className={
                    router.pathname.includes("/earn")
                      ? "bg-main1 border border-main text-main2 transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-1 text-[11px]"
                      : "text-grey1 border border-transparent transition-all py-1.5 px-3 text-sm flex items-center cursor-pointer gap-x-1 text-[11px]"
                  }
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 16 16"
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                    <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"></path>
                  </svg>
                  EARN
                </div>
              </Link>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
