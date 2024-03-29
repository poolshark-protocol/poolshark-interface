import { useShallow } from "zustand/react/shallow";
import { useTradeStore } from "../../../hooks/useTradeStore";

const SwitchDirection = ({
  displayIn,
  displayOut,
}: {
  displayIn: string;
  displayOut: string;
}) => {
  const [switchDirection, exactIn, setAmountIn, setAmountOut] = useTradeStore(
    useShallow((state) => [
      state.switchDirection,
      state.exactIn,
      state.setAmountIn,
      state.setAmountOut,
    ]),
  );

  return (
    <div
      onClick={() => {
        switchDirection(
          exactIn,
          exactIn ? displayIn : displayOut,
          exactIn ? setAmountIn : setAmountOut,
        );
      }}
      className="flex items-center justify-center w-full pt-10 pb-3"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 cursor-pointer"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
        />
      </svg>
    </div>
  );
};

export default SwitchDirection;
