import { useEffect, useState } from 'react';
import { maxWidth, minWidth } from '../../ambient-utils/types/mediaQueries';

type centralQueries = maxWidth | minWidth;

type MediaQueryResults = {
    xs: boolean; // 1px - 599px
    sm: boolean; // 600px - 899px
    md: boolean; // 900px - 1199px
    lg: boolean; // 1200px - 1599px
    xl: boolean; // 1600px - 1919px
    ultra: boolean; // 1920px and above
};

export function useMediaQuery(): MediaQueryResults;
export function useMediaQuery(query: centralQueries | string): boolean;

export function useMediaQuery(
    query?: centralQueries | string,
): boolean | MediaQueryResults {
    const defaultQueries = {
        xs: '(min-width: 1px) and (max-width: 599px)',
        sm: '(min-width: 600px) and (max-width: 899px)',
        md: '(min-width: 900px) and (max-width: 1199px)',
        lg: '(min-width: 1200px) and (max-width: 1599px)',
        xl: '(min-width: 1600px) and (max-width: 1919px)',
        ultra: '(min-width: 1920px)',
    };

    const getMatches = (query: string): boolean => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    };

    const [matches, setMatches] = useState<boolean | MediaQueryResults>(() => {
        if (query) {
            return getMatches(query);
        } else {
            return (
                Object.keys(defaultQueries) as (keyof MediaQueryResults)[]
            ).reduce((acc, key) => {
                acc[key] = getMatches(defaultQueries[key]);
                return acc;
            }, {} as MediaQueryResults);
        }
    });

    const handleChange = () => {
        if (query) {
            setMatches(getMatches(query));
        } else {
            setMatches(
                (
                    Object.keys(defaultQueries) as (keyof MediaQueryResults)[]
                ).reduce((acc, key) => {
                    acc[key] = getMatches(defaultQueries[key]);
                    return acc;
                }, {} as MediaQueryResults),
            );
        }
    };

    useEffect(() => {
        if (query) {
            const matchMedia = window.matchMedia(query);
            handleChange();

            if (matchMedia.addEventListener) {
                matchMedia.addEventListener('change', handleChange);
            } else {
                matchMedia.addListener(handleChange);
            }

            return () => {
                if (matchMedia.removeEventListener) {
                    matchMedia.removeEventListener('change', handleChange);
                } else {
                    matchMedia.removeListener(handleChange);
                }
            };
        } else {
            const mediaMatchers = Object.values(defaultQueries).map((query) =>
                window.matchMedia(query),
            );

            handleChange();

            mediaMatchers.forEach((matchMedia) => {
                if (matchMedia.addEventListener) {
                    matchMedia.addEventListener('change', handleChange);
                } else {
                    matchMedia.addListener(handleChange);
                }
            });

            return () => {
                mediaMatchers.forEach((matchMedia) => {
                    if (matchMedia.removeEventListener) {
                        matchMedia.removeEventListener('change', handleChange);
                    } else {
                        matchMedia.removeListener(handleChange);
                    }
                });
            };
        }
    }, [query]);

    return matches;
}
