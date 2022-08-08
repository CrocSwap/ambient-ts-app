import { useEffect, useMemo, useState } from 'react';
import { useChain } from 'react-moralis';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

export const useAppChain = () => {
    const {
        // switchNetwork,
        chainId,
        // chain,
        // account
    } = useChain();

    const defaultChain = '0x5';

    const [ currentChain, setCurrentChain ] = useState(defaultChain);

    useEffect(() => {
        if (chainId !== currentChain) {
            chainId ?? console.log(`updating chain to: ${chainId ?? defaultChain}`);
            setCurrentChain(chainId ?? defaultChain);
        }
    }, [chainId]);

    const chainData = useMemo(() => {
        const requestedChain = chainId ?? defaultChain;
        let chn;
        try {
            chn = lookupChain(requestedChain);
        } catch (err) {
            console.warn(err);
            chn = lookupChain(defaultChain);
        }
        return chn;
    }, [chainId]);

    return chainData;
}