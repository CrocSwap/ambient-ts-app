import { useEffect, useState } from 'react';
import { maxWidth, minWidth } from '../../ambient-utils/types/mediaQueries';

type centralQueries = maxWidth | minWidth;

// all atomic screen ranges
type baseMediaQueries =
    | 'isWidescreen'
    | 'isDesktop'
    | 'isLaptop'
    | 'isTabletWide'
    | 'isTabletNarrow'
    | 'isCellphone';

// booleans for all atomic screen range sizes and union sizes
export interface MediaQueryResultsIF extends Record<baseMediaQueries, boolean> {
    // isWidescreen || isDesktop || isLaptop
    isComputer: boolean;
    // isTabletWide || isTabletNarrow || isCellphone
    isMobile: boolean;
}

// fn signature with no argument (will return all standard query results)
export function useMediaQuery(): MediaQueryResultsIF;
// fn signature with a query string provided (will return that query only)
export function useMediaQuery(query: centralQueries | string): boolean;

// overload function definition
export function useMediaQuery(
    query?: centralQueries | string,
): boolean | MediaQueryResultsIF {
    // fn to build a query string from template
    function makeQueryString(low: number, high?: number): string {
        let output = `(min-width: ${low.toString()}px)`;
        if (high) output += `and (max-width: ${high.toString()}px)`;
        return output;
    }

    // all atomic media queries (does not have union data)
    const defaultQueries: Record<baseMediaQueries, string> = {
        isWidescreen: makeQueryString(1921),
        isDesktop: makeQueryString(1281, 1920),
        isLaptop: makeQueryString(1025, 1280),
        isTabletWide: makeQueryString(769, 1024),
        isTabletNarrow: makeQueryString(481, 768),
        isCellphone: makeQueryString(1, 480),
    };

    // state variable holding data to output from the hook
    const [matches, setMatches] = useState<boolean | MediaQueryResultsIF>(() =>
        runQueries(query),
    );

    // fn to run media queries depending on data used to instantiate hook
    function runQueries(q?: string): boolean | MediaQueryResultsIF {
        // fn to run a given media query
        function getMatches(query: string): boolean {
            // return media query result if `window` obj exists
            if (typeof window !== 'undefined') {
                return window.matchMedia(query).matches;
            }
            // return `false` if window obj does not exist
            return false;
        }
        // output variable
        let output: boolean | MediaQueryResultsIF;
        // if a query string is provided, process that query string only
        // if no query string is provided, run all standard queries
        if (q) {
            output = getMatches(q);
        } else {
            // result of all base (atomic) media queries
            const rawOutput = (
                Object.keys(defaultQueries) as baseMediaQueries[]
            ).reduce(function (acc, key) {
                acc[key] = getMatches(defaultQueries[key]);
                return acc;
            }, {} as MediaQueryResultsIF);
            // deconstruct data from basic media inquiries
            const {
                isWidescreen,
                isDesktop,
                isLaptop,
                isTabletWide,
                isTabletNarrow,
                isCellphone,
            } = rawOutput;
            // decorate data from basic inquiries with union values
            output = {
                ...rawOutput,
                isComputer: isWidescreen || isDesktop || isLaptop,
                isMobile: isTabletWide || isTabletNarrow || isCellphone,
            };
        }
        // return output variable
        return output;
    }

    // event listener for DOM
    const handleChange = () => setMatches(runQueries(query));

    // logic to handle event listener in DOM
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

    // return data from queries for instantiation of the hook
    return matches;
}
