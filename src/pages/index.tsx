import Swap from "./Swap";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen ">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <Swap />
      </div>
    </div>
  );
}
