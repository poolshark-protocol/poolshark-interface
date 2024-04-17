import { useAccount as useAccountWagmi } from "wagmi";

export default function useAccount() {
  const { address, isConnected, isDisconnected } = useAccountWagmi();

  return { address, isConnected, isDisconnected };
}
