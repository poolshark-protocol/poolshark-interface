const MaxButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
    >
      MAX
    </button>
  );
};

export default MaxButton;
