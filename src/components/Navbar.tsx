import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import { ConnectWalletButton } from './Buttons/ConnectWalletButton'

export default function Navbar() {
  const router = useRouter()
  const homeHref = 'https://poolshark.fi/'

  return (
    <div className="md:px-10 px-4 pt-3 mx-auto w-full">
      <div className="relative flex items-center justify-between h-16 w-full">
        <div className="lg:grid flex justify-between items-center grid-cols-3 w-full mx-auto">
          <div className="flex items-center justify-start flex-shrink-0">
            <div className="relative lg:w-40 lg:h-40">
              <div className="hidden lg:block">
                <a href={homeHref}>
                  <Image
                    src="/static/images/poolsharkmain.png"
                    className="cursor-pointer"
                    layout="fill"
                    priority={true}
                    quality="90"
                    objectFit="contain"
                  />
                </a>
              </div>
              <div className="block lg:hidden">
                <Image
                  src="/static/images/logo.png"
                  width={60}
                  height={50}
                  quality="90"
                  objectFit="contain"
                />
              </div>
            </div>
          </div>
          <div className="hidden m-auto border flex justify-center border-grey1 rounded-xl p-[2.5px] md:block bg-black">
            <div className="flex gap-x-2">
              <Link href="/">
                <div
                  className={
                    router.pathname == '/'
                      ? 'bg-background text-main transition-all py-2 px-6 rounded-lg text-sm font-medium cursor-pointer'
                      : 'text-grey hover:text-white py-2 px-6 rounded-lg text-sm font-medium cursor-pointer'
                  }
                >
                  Swap
                </div>
              </Link>
              <Link href="/pool">
                <div
                  className={
                    router.pathname == '/pool'
                      ? 'bg-background text-main transition-all py-2 px-6 rounded-lg text-sm font-medium cursor-pointer'
                      : 'text-grey hover:text-white py-2 px-6 rounded-lg text-sm font-medium cursor-pointer'
                  }
                >
                  Pool
                </div>
              </Link>
              <Link
                href={{
                  pathname: '/cover',
                  query: {
                    state: 'nav',
                  },
                }}
              >
                <div
                  className={
                    router.pathname == '/cover'
                      ? 'bg-background text-main transition-all py-2 px-6 rounded-lg text-sm font-medium cursor-pointer'
                      : 'text-grey hover:text-white py-2 px-6 rounded-lg text-sm font-medium cursor-pointer'
                  }
                >
                  Cover
                </div>
              </Link>
            </div>
          </div>
          <div className=" flex justify-end items-center gap-x-4">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    </div>
  )
}
