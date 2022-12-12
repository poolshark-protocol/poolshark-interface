import { PlusSmallIcon } from "@heroicons/react/24/outline";
import Head from "next/head";
import Image from "next/image";
import { useState, Fragment } from "react";
import { Menu, Transition, Dialog } from "@headlessui/react";
import {
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";

export default function PoolList() {
  return (
    <table className="w-full table-auto">
      <thead className="mb-3">
        <tr className="text-xs text-grey">
          <th className="text-left font-light">Name</th>
          <th className="text-right font-light">TVL</th>
          <th className="text-right font-light">Volume(24h)</th>
          <th className="text-right font-light">Volume(7d)</th>
        </tr>
      </thead>
      <tbody>
        <tr className="text-right">
          <td className="text-left flex items-center gap-x-5 py-2.5">
            <div className="flex items-center ">
              <img height="30" width="30" src="/static/images/token.png" />
              <img
                height="30"
                width="30"
                className="ml-[-8px]"
                src="/static/images/token.png"
              />
            </div>
            DAI-USDC
          </td>
          <td>$400.32m</td>
          <td>$19.69m</td>
          <td>$64.98m</td>
        </tr>
        <tr className="text-right">
          <td className="text-left flex items-center gap-x-5 py-2.5">
            <div className="flex items-center ">
              <img height="30" width="30" src="/static/images/token.png" />
              <img
                height="30"
                width="30"
                className="ml-[-8px]"
                src="/static/images/token.png"
              />
            </div>
            DAI-USDC
          </td>
          <td>$400.32m</td>
          <td>$19.69m</td>
          <td>$64.98m</td>
        </tr>
        <tr className="text-right">
          <td className="text-left flex items-center gap-x-5 py-2.5">
            <div className="flex items-center ">
              <img height="30" width="30" src="/static/images/token.png" />
              <img
                height="30"
                width="30"
                className="ml-[-8px]"
                src="/static/images/token.png"
              />
            </div>
            DAI-USDC
          </td>
          <td>$400.32m</td>
          <td>$19.69m</td>
          <td>$64.98m</td>
        </tr>
        <tr className="text-right">
          <td className="text-left flex items-center gap-x-5 py-2.5">
            <div className="flex items-center ">
              <img height="30" width="30" src="/static/images/token.png" />
              <img
                height="30"
                width="30"
                className="ml-[-8px]"
                src="/static/images/token.png"
              />
            </div>
            DAI-USDC
          </td>
          <td>$400.32m</td>
          <td>$19.69m</td>
          <td>$64.98m</td>
        </tr>
        <tr className="text-right">
          <td className="text-left flex items-center gap-x-5 py-2.5">
            <div className="flex items-center ">
              <img height="30" width="30" src="/static/images/token.png" />
              <img
                height="30"
                width="30"
                className="ml-[-8px]"
                src="/static/images/token.png"
              />
            </div>
            DAI-USDC
          </td>
          <td>$400.32m</td>
          <td>$19.69m</td>
          <td>$64.98m</td>
        </tr>
        <tr className="text-right">
          <td className="text-left flex items-center gap-x-5 py-2.5">
            <div className="flex items-center ">
              <img height="30" width="30" src="/static/images/token.png" />
              <img
                height="30"
                width="30"
                className="ml-[-8px]"
                src="/static/images/token.png"
              />
            </div>
            DAI-USDC
          </td>
          <td>$400.32m</td>
          <td>$19.69m</td>
          <td>$64.98m</td>
        </tr>
        <tr className="text-right">
          <td className="text-left flex items-center gap-x-5 py-2.5">
            <div className="flex items-center ">
              <img height="30" width="30" src="/static/images/token.png" />
              <img
                height="30"
                width="30"
                className="ml-[-8px]"
                src="/static/images/token.png"
              />
            </div>
            DAI-USDC
          </td>
          <td>$400.32m</td>
          <td>$19.69m</td>
          <td>$64.98m</td>
        </tr>
        <tr className="text-right">
          <td className="text-left flex items-center gap-x-5 py-2.5">
            <div className="flex items-center ">
              <img height="30" width="30" src="/static/images/token.png" />
              <img
                height="30"
                width="30"
                className="ml-[-8px]"
                src="/static/images/token.png"
              />
            </div>
            DAI-USDC
          </td>
          <td>$400.32m</td>
          <td>$19.69m</td>
          <td>$64.98m</td>
        </tr>
        
      </tbody>
    </table>
  );
}
