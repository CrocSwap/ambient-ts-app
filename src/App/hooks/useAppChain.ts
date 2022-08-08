import { useMemo } from 'react';
import { useChain } from 'react-moralis';

export const useAppChain = () => {
    const {
        // switchNetwork,
        chainId,
        // chain,
        // account
    } = useChain();

    const currentChain = useMemo(() => chainId ?? '0x5', [chainId]);

    return currentChain;
}