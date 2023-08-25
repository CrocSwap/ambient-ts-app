import { ANALYTICS_URL, IS_LOCAL_ENV } from '../../constants';

interface argsIF {
    base: string;
    quote: string;
    poolIdx: string;
    chainId: string;
}

export const fetchPoolInfo = (args: argsIF) => {
    const { base, quote, poolIdx, chainId } = args;

    IS_LOCAL_ENV && console.debug('fetching pool recent changes');

    const poolChanges = fetch(
        ANALYTICS_URL +
            new URLSearchParams({
                base,
                quote,
                poolIdx,
                chainId,
            }),
    )
        .then((response) => response?.json())
        .catch(console.error);

    return poolChanges;
};
