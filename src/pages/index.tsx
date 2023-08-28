import Trade from "./Trade";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className=" bg-no-repeat bg-black min-h-screen ">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <Trade />
      </div>
    </div>
  );
}
