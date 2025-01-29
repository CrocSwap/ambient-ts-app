import { useEffect, useState } from 'react';
import { maxWidth, minWidth } from '../../ambient-utils/types/mediaQueries';

export type Breakpoint =
    | 'tabletPortrait'
    | 'tabletLandscape'
    | 'mobilePortrait'
    | 'mobileLandscape'
    | 'desktop'
    | 'desktopLarge';

type centralQueries = maxWidth | minWidth;

// Map breakpoints to CSS variable names
const cssVariableMap: Record<Breakpoint, string> = {
    tabletPortrait: 'tablet-portrait',
    tabletLandscape: 'tablet-landscape',
    mobilePortrait: 'mobile-portrait',
    mobileLandscape: 'mobile-landscape',
    desktop: 'desktop',
    desktopLarge: 'desktop-large',
};

function getMediaQueryFromCSSVar(breakpoint: Breakpoint): string {
    if (typeof window === 'undefined') return '';
    const styles = getComputedStyle(document.documentElement);
    const query = styles
        .getPropertyValue(`--${cssVariableMap[breakpoint]}`)
        .trim();
    return query;
}

function useMediaQuery(query: Breakpoint | centralQueries | string): boolean {
    const getMatches = (queryString: string): boolean => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(queryString).matches;
        }
        return false;
    };

    // Convert breakpoint to query string if needed
    const getQueryString = () => {
        if (typeof query === 'string' && query in cssVariableMap) {
            return getMediaQueryFromCSSVar(query as Breakpoint);
        }
        return query;
    };

    const [queryString, setQueryString] = useState(getQueryString());
    const [matches, setMatches] = useState<boolean>(() =>
        getMatches(queryString),
    );

    // Update query string if CSS variables change
    useEffect(() => {
        if (typeof query === 'string' && query in cssVariableMap) {
            const newQueryString = getQueryString();
            setQueryString(newQueryString);
        }
    }, [query]);

    useEffect(() => {
        const matchMedia = window.matchMedia(queryString);

        const handleChange = () => {
            setMatches(getMatches(queryString));
        };

        handleChange();
        matchMedia.addEventListener('change', handleChange);

        return () => {
            matchMedia.removeEventListener('change', handleChange);
        };
    }, [queryString]);

    return matches;
}

export default useMediaQuery;
