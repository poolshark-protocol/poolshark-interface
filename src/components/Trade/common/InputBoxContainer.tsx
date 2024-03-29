import { PropsWithChildren } from "react";

const InputBoxContainer = ({ children }: PropsWithChildren) => {
  return (
    <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
      {children}
    </div>
  );
};

export default InputBoxContainer;
