import { Popover } from '@headlessui/react'

export default function TickSpacing({}) {

  return (
    <div className="bg-dark border-grey2 border text-sm pt-4 pb-6 px-3 rounded-xl text-grey w-72">
      <div className="text-lg font-bold mb-2 text-white">Attention</div>
      Prices might slightly fluctuate due to Tick Spacing math.{" "}
      <a><span className="underline text-main">What does this mean?</span></a>
    </div>
  );
}
