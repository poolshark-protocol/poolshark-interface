import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const ErrorToast = ({errorDisplay, setErrorDisplay, hash}) => {
  return (
    <div className="bg-black py-3 px-4 rounded-xl flex gap-x-5">
      <div>
        <div className="flex gap-x-2 pb-1">
          <ExclamationTriangleIcon className="w-6 text-red-500" />
          <h1>Your transaction was not completed</h1>
        </div>
        <a
          href={`https://goerli.etherscan.io/tx/${hash}`}
          target="_blank"
          className="text-xs text-blue-500 underline"
        >
          View on Block Explorer
        </a>
      </div>
      <XMarkIcon
        onClick={() => setErrorDisplay(false)}
        className="w-6 text-gray-400 cursor-pointer"
      />
    </div>
  );
};
