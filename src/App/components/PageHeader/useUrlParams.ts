import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useUrlParams = () => {
    // current URL pathway
    const { pathname } = useLocation();

    // function to isolate the URL params from the full pathway
    const makeParamsSlug = (url: string) => {
        // hold copy of a string in a mutable variable
        let paramsString = url;
        // chop off leading characters until only the params remain
        while (paramsString && !paramsString.startsWith('/chain=')) {
            paramsString = paramsString.slice(1);
        }
        // return string with URL paramas
        return paramsString;
    }

    // params slug to use in URL bar on header navigation
    // useState() + useEffect() is necessary over useMemo() to
    // ... only overwrite the value conditionally
    const [paramsSlug, setParamsSlug] = useState(makeParamsSlug(pathname));
    useEffect(() => {
        // make a new params slug from the URL path
        const newSlug = makeParamsSlug(pathname);
        // prevent overwrite if there are no params
        newSlug && setParamsSlug(newSlug);
    }, [pathname]);

    return paramsSlug;
}