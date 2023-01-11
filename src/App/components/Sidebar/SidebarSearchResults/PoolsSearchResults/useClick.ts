import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TokenPairIF } from '../../../../../utils/interfaces/exports';

export const useClick = (
    chainId: string,
    tokenPair: TokenPairIF
): (baseAddr: string, quoteAddr: string) => void => {
    // get the current URL path string
    const { pathname } = useLocation();
    // get the navigate function from react-router-dom
    const navigate = useNavigate();

    // slug to start the new URL string before params
    // recalculate every time the URL path changes
    const locationSlug = useMemo<string>(() => {
        // output variable
        let slug: string;
        // logic to get current starting path
        // error handling if on an unrecognized path goes to `/trade/market`
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
        // return URL slug
        return slug;
    }, [pathname]);

    // fn generate a new URL slug and navigate to it
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