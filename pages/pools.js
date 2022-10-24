import {
    AdjustmentsHorizontalIcon,
    ArrowSmallDownIcon,
    DocumentArrowDownIcon,
  } from "@heroicons/react/24/outline";
  import Head from "next/head";
  import Image from "next/image";
  import { useState, Fragment } from "react";
  import { Menu, Transition } from "@headlessui/react";
  import { ChevronDownIcon } from "@heroicons/react/20/solid";
  
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  
  export default function Home() {
    return (
      <div className="flex items-center w-full h-screen text-white ">
        <div className="flex flex-col w-full m-4 max-w-md p-6 mx-auto bg-black border border-[#313131] rounded-lg">
      
        </div>
      </div>
    );
  }
  