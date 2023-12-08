import Link from "next/link";


export default function Notification() {

  return (
    <div className="text-white absolute top-24 right-5 border-grey border bg-dark p-5 rounded-[4px] md:block hidden">
        <h1 className="text-white text-sm">BOND AVAILABLE TO REEDEM</h1>
        <Link href="/bond"><div className="mt-0.5 cursor-pointer hover:opacity-80 text-main2 text-xs underline flex items-center justify-between gap-x-2">Click here to reedem it
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
</svg>
</div>
        </Link>
    </div>
  );
}
