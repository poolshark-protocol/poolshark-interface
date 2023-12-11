import TermsOfService from "../components/Modals/ToS";
import { useState } from "react";


export default function Home() {
    const [isOpen, setIsOpen] = useState(false);

    const handleTosAccept = () => {
        setIsOpen(false)
    };

  return (
    <div className="bg-black h-screen w-screen flex items-center justify-center text-white px-5">
        <TermsOfService isOpen={isOpen} setIsOpen={setIsOpen} onAccept={handleTosAccept} read={true}/>
      <div className="bg-dark border border-grey p-4 max-w-lg rounded-[4px]">
        <h1>Access Restricted</h1>
        <p className="text-white/60 text-sm mt-2 mb-4">Unfortunately, the country you are connecting from is not supported.</p>
        <span className="text-xs text-white/60">Read our <button onClick={() => setIsOpen(true)} className="underline hover:text-white cursor-pointer">terms of service</button> for more information</span>
      </div>
    </div>
  );
}