import { PropsWithChildren } from "react";

const FeeTierBox = ({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
} & PropsWithChildren) => {
  return (
    <div
      className={
        selected
          ? "py-1.5 text-sm border-grey1 bg-grey/40 transition-all cursor-pointer border border-grey md:px-5 px-3 rounded-[4px]"
          : "py-1.5 text-sm bg-dark hover:border-grey1 hover:bg-grey/40 transition-all cursor-pointer border border-grey md:px-5 px-3 rounded-[4px]"
      }
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default FeeTierBox;
