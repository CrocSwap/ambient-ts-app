import { useMemo } from 'react';
import { useChain } from 'react-moralis';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

export const useAppChain = () => {
    const {
        // switchNetwork,
        chainId,
        // chain,
        // account
    } = useChain();

    const currentChain = useMemo(() => (
        lookupChain(chainId ?? '0x5')
    ), [chainId]);

    return currentChain;
}