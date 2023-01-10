import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { TokenPairIF } from '../../../../../utils/interfaces/exports';

export const useClick = (tokenPair: TokenPairIF): void => {
    const {pathname} = useLocation();
    const locationSlug = useMemo<string>(() => {
        let slug: string;
        try {
            if (pathname.startsWith('/trade/market') || pathname.startsWith('/account')) {
                slug = '/trade/market';
            } else if (pathname.startsWith('/trade/limit')) {
                slug = '/trade/limit';
            } else if (pathname.startsWith('/trade/range')) {
                slug = '/trade/range';
            } else {
                throw new Error('Could not identify the correct URL path for redirect. Using /trade/market as a fallback value. Refer to useClick.tsx for troubleshooting.');
            }
        } catch (err) {
            console.warn(err);
            slug = '/trade/market';
        }
        return slug;
    }, [pathname]);
    console.log({locationSlug});
    console.log({tokenPair});
}