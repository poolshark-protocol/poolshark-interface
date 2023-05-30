import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export const ErrorToast = ({ errorDisplay, setErrorDisplay, hash }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (errorDisplay) {
      const timeout = setTimeout(() => {
        setFadeOut(true);
      }, 3000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [errorDisplay]);

  useEffect(() => {
    if (fadeOut) {
      const timeout = setTimeout(() => {
        setErrorDisplay(false);
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [fadeOut, setErrorDisplay]);

  if (!errorDisplay) {
    return null;
  }

  return (
    <div
      className={`bg-black py-3 px-4 rounded-xl flex gap-x-5 front ${
        fadeOut ? "fade-out" : ""
      }`}
    >
      <div>
        <div className="flex gap-x-2 pb-1">
          <ExclamationTriangleIcon className="w-6 text-red-500" />
          <h1>Your Transaction was not completed</h1>
        </div>
        <a
          href={`https://goerli.arbiscan.io/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
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
