import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const ErrorToast = () => {
  return (
    <div className="absolute bottom-4 right-4 bg-black py-3 px-4 rounded-xl flex gap-x-5">
      <div>
        <div className="flex gap-x-2 pb-1">
          <ExclamationTriangleIcon className="w-6 text-red-500" />
          <h1>Your transaction was not completed</h1>
        </div>
        <a className="text-xs text-blue-500 underline">
          View on Block Explorer
        </a>
      </div>
      <XMarkIcon className="w-6 text-gray-400" />
    </div>
  );
};
