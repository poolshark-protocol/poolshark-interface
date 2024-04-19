import { useEthersSigner } from "../utils/viemEthersAdapters";

export default function useSigner() {
  const signer = useEthersSigner();

  return { signer };
}
