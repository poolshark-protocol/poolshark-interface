import Trade from "./Trade";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="bg-black min-h-screen relative">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <Trade />
      </div>
      {/*<Notification />*/}
    </div>
  );
}
