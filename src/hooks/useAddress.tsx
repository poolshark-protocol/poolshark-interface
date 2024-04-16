import { useAccount } from "wagmi";

export default function useAddress() {
  const { address } = useAccount();

  return address;
}
