import { checkBlacklist } from '../../ambient-utils/constants';
import { useContext, useEffect } from 'react';
import { UserDataContext } from '../../contexts/UserDataContext';

export function useBlacklist(account: `0x${string}` | undefined): void {
    const { disconnectUser } = useContext(UserDataContext);

    useEffect(() => {
        if (account && checkBlacklist(account)) {
            disconnectUser();
            location.replace('https://ofac.treasury.gov');
        }
    }, [account]);
}
