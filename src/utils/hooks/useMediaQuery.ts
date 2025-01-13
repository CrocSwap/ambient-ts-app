import { useEffect, useState } from 'react';
import { maxWidth, minWidth } from '../../ambient-utils/types/mediaQueries';

type centralQueries = maxWidth | minWidth;

export function useMediaQuery(query: centralQueries | string): boolean {
    const getMatches = (query: string): boolean => {
        // Prevents SSR issues
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    };

    const isWidescreen = window.matchMedia('(min-width: 1921px)');
    console.log(isWidescreen.matches);

    const [matches, setMatches] = useState<boolean>(getMatches(query));

    function handleChange() {
        setMatches(getMatches(query));
    }

    useEffect(() => {
        const matchMedia = window.matchMedia(query);

        // Triggered at the first client-side load and if query changes
        handleChange();

        // Listen matchMedia
        if (matchMedia.addEventListener) {
            matchMedia.addEventListener('change', handleChange);
        } else {
            matchMedia.addEventListener('change', handleChange);
        }

        return () => {
            if (matchMedia.addEventListener) {
                matchMedia.addEventListener('change', handleChange);
            } else {
                matchMedia.removeEventListener('change', handleChange);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    return matches;
}
