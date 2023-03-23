export default function PoolList({
  tokenOneName,
  tokenZeroName,
  tvlUsd,
  volumeUsd,
  volumeEth}) {
  
  return (
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
        {tokenOneName}-{tokenZeroName}
      </td>
      <td>${tvlUsd}m</td>
      <td>${volumeUsd}m</td>
      <td>${volumeEth}m</td>
    </tr>
  );
}
