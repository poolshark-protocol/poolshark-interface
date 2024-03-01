import Image from "next/image";
import Link from "next/link";

export default function Error() {
  return (
    <div className="h-screen flex md:flex-row flex-col items-center justify-center w-full gap-14 px-5">
      <Image
        src="https://poolshark-token-lists.s3.amazonaws.com/images/logoascii.png"
        width={480}
        height={400}
        className=""
        alt="Poolshark logo"
      />
      <div className="text-white gap-y-14 flex flex-col md:items-start items-center text-center md:text-left">
        <h1 className="text-3xl md:w-[450px]">
          Oops! This page doesn’t exist.
        </h1>
        <Link href="/">
          <button className="flex items-center cursor-pointer justify-center text-main2/80 hover:underline hover:text-main2 transitiona-all gap-x-2">
            Go to Home page
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
}
