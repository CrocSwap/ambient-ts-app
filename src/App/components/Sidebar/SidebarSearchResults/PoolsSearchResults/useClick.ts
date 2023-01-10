import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TokenPairIF } from '../../../../../utils/interfaces/exports';

export const useClick = (
    chainId: string,
    tokenPair: TokenPairIF
): (baseAddr: string, quoteAddr: string) => void => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const locationSlug = useMemo<string>(() => {
        let slug: string;
        try {
            if (
                pathname.startsWith('/trade/market') ||
                pathname.startsWith('/account')
            ) {
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

    const handleClick = (baseAddr: string, quoteAddr: string): void => {
        const { dataTokenA } = tokenPair;

        const tokenAString =
            baseAddr.toLowerCase() === dataTokenA.address.toLowerCase()
                ? baseAddr
                : quoteAddr;
        const tokenBString =
            baseAddr.toLowerCase() === dataTokenA.address.toLowerCase()
                ? quoteAddr
                : baseAddr;

        navigate(
            locationSlug +
            '/chain=' +
            chainId +
            '&tokenA=' +
            tokenAString +
            '&tokenB=' +
            tokenBString
        );
    }

    return handleClick;
}