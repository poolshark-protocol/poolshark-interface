import { PropsWithChildren } from "react";

const PriceRangeBox = ({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (e: any) => void;
} & PropsWithChildren) => {
  return (
    <div className="border border-grey w-full bg-dark flex flex-col items-center justify-center py-4">
      <span className="text-center text-xs text-grey1 mb-2">{children}</span>
      <input
        autoComplete="off"
        className="outline-none bg-transparent text-3xl w-1/2 md:w-56 text-center mb-2"
        value={!isNaN(parseFloat(value)) ? value : 0}
        type="text"
        onChange={onChange}
      />
    </div>
  );
};

export default PriceRangeBox;
