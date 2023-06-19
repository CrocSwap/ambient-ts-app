import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const useLocationSlug = (): string => {
    // TODO: get location from App.tsx and pass it through props
    const { pathname } = useLocation();

    const locationSlug = useMemo<string>(() => {
        let slug = '';
        // TODO: there must be a better way to do this
        if (pathname.startsWith('/trade/market')) {
            slug = '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            slug = '/trade/limit';
        } else if (pathname.startsWith('/trade/pool')) {
            slug = '/trade/pool';
        } else if (pathname.startsWith('/swap')) {
            slug = '/swap';
        }
        return slug;
    }, [pathname]);

    return locationSlug;
};
