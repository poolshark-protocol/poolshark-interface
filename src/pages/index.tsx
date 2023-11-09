import Trade from "./Trade";
import Navbar from "../components/Navbar";
import Notification from "../components/Modals/Notification";

export default function Home() {
  return (
    <div className="bg-black min-h-screen relative">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <Trade />
      </div>
      <Notification />
    </div>
  );
}
