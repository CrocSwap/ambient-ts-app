import { useEffect, useState } from 'react';
import { maxWidth, minWidth } from '../../ambient-utils/types/mediaQueries';

type centralQueries = maxWidth | minWidth;

export interface MediaQueryResultsIF {
    isWidescreen: boolean;
    isDesktop: boolean;
    isLaptop: boolean;
    isTabletWide: boolean;
    isTabletNarrow: boolean;
    isCellphone: boolean;
}

export function useMediaQuery(): MediaQueryResultsIF;
export function useMediaQuery(query: centralQueries | string): boolean;

export function useMediaQuery(
    query?: centralQueries | string,
): boolean | MediaQueryResultsIF {
    function makeQueryString(low: number, high?: number): string {
        let output = `(min-width: ${low.toString()}px)`;
        if (high) output += `and (max-width: ${high.toString()}px)`;
        return output;
    }
    const defaultQueries = {
        isWidescreen: makeQueryString(1921),
        isDesktop: makeQueryString(1281, 1920),
        isLaptop: makeQueryString(1025, 1280),
        isTabletWide: makeQueryString(769, 1024),
        isTabletNarrow: makeQueryString(481, 768),
        isCellphone: makeQueryString(1, 480),
    };

    const getMatches = (query: string): boolean => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    };

    const [matches, setMatches] = useState<boolean | MediaQueryResultsIF>(() =>
        runQueries(query),
    );

    const handleChange = () => {
        setMatches(runQueries(query));
    };

    function runQueries(q?: string): boolean | MediaQueryResultsIF {
        if (q) {
            return getMatches(q);
        } else {
            return (
                Object.keys(defaultQueries) as (keyof MediaQueryResultsIF)[]
            ).reduce(function (acc, key) {
                acc[key] = getMatches(defaultQueries[key]);
                return acc;
            }, {} as MediaQueryResultsIF);
        }
    }

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
