import { useEffect, useState } from 'react';
import { maxWidth, minWidth } from '../../ambient-utils/types/mediaQueries';

type centralQueries = maxWidth | minWidth;

type MediaQueryResultsIF = {
    xs: boolean; // 1px - 599px
    sm: boolean; // 600px - 899px
    md: boolean; // 900px - 1199px
    lg: boolean; // 1200px - 1599px
    xl: boolean; // 1600px - 1919px
    ultra: boolean; // 1920px and above
};

export function useMediaQuery(): MediaQueryResultsIF;
export function useMediaQuery(query: centralQueries | string): boolean;

export function useMediaQuery(
    query?: centralQueries | string,
): boolean | MediaQueryResultsIF {
    function makeQueryString(low: number, high: number): string {
        const l: string = low.toString();
        const h: string = high.toString();
        return `(min-width: ${l}px) and (max-width: ${h}px)`;
    }
    const defaultQueries = {
        xs: makeQueryString(1, 599),
        sm: makeQueryString(600, 899),
        md: makeQueryString(900, 1199),
        lg: makeQueryString(1200, 1599),
        xl: makeQueryString(1600, 1919),
        ultra: makeQueryString(1920, 999999),
    };

    const getMatches = (query: string): boolean => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    };

    const [matches, setMatches] = useState<boolean | MediaQueryResultsIF>(
        () => {
            if (query) {
                return getMatches(query);
            } else {
                return (
                    Object.keys(defaultQueries) as (keyof MediaQueryResultsIF)[]
                ).reduce((acc, key) => {
                    acc[key] = getMatches(defaultQueries[key]);
                    return acc;
                }, {} as MediaQueryResultsIF);
            }
        },
    );

    const handleChange = () => {
        if (query) {
            setMatches(getMatches(query));
        } else {
            setMatches(
                (
                    Object.keys(defaultQueries) as (keyof MediaQueryResultsIF)[]
                ).reduce((acc, key) => {
                    acc[key] = getMatches(defaultQueries[key]);
                    return acc;
                }, {} as MediaQueryResultsIF),
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
