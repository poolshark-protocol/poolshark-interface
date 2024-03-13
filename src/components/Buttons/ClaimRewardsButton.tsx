export default function ClaimRewardsButton({}) {
  return (
    <>
      <button
        disabled={true}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
      >
        NOTHING TO CLAIM
      </button>
    </>
  );
}
