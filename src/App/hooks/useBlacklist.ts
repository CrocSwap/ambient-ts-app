import { useEffect } from 'react';
import { useDisconnect } from 'wagmi';
import { checkBlacklist } from '../../ambient-utils/src/constants';

export function useBlacklist(account: `0x${string}` | undefined): void {
    const { disconnect } = useDisconnect();

    useEffect(() => {
        if (account && checkBlacklist(account)) {
            disconnect();
            location.replace('https://ofac.treasury.gov');
        }
    }, [account]);
}
