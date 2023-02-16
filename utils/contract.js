import {
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
} from 'wagmi';
  
const read = ({ abi, address, functionName, params, enabled }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useContractRead({
        abi,
        address,
        functionName,
        args: params,
        enabled,
    });
};

const write = ({
    abi,
    address,
    functionName,
    params,
    onSuccess,
    onError,
    enabled,
}) => {
const {
    config,
    error: prepareWriteError,
    refetch,
    // eslint-disable-next-line react-hooks/rules-of-hooks
} = usePrepareContractWrite({
    abi,
    address,
    functionName,
    args: params,
    enabled,
});

// eslint-disable-next-line react-hooks/rules-of-hooks
const writeResults = useContractWrite({
    ...config,
    onSuccess,
    onError,
});


return { refetch, prepareWriteError, ...writeResults };
};

const contract = { read, write };

export default contract;