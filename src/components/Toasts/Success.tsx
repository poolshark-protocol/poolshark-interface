import {
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export const SuccessToast = ({ successDisplay, setSuccessDisplay, hash }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (successDisplay) {
      const timeout = setTimeout(() => {
        setFadeOut(true);
      }, 1000000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [successDisplay]);

  useEffect(() => {
    if (fadeOut) {
      const timeout = setTimeout(() => {
        setSuccessDisplay(false);
      }, 100000000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [fadeOut, setSuccessDisplay]);

  if (!successDisplay) {
    return null;
  }

  return (
    <div
      className={`bg-black py-3 px-4 rounded-xl flex gap-x-5 front border-grey border ${
        fadeOut ? "fade-out" : ""
      }`}
    >
      <div>
        <div className="flex gap-x-2 pb-1">
          <CheckCircleIcon className="w-6 text-green-500" />
          <h1>Your Transaction was successful</h1>
        </div>
        <a
          href={`https://goerli.arbiscan.io/tx/${hash}`}
          rel="noreferrer"
          target="_blank"
          className="text-xs text-blue-500 underline"
        >
          View on Block Explorer
        </a>
      </div>
      <XMarkIcon
        onClick={() => setFadeOut(true)}
        className="w-6 text-gray-400 cursor-pointer"
      />
    </div>
  );
};