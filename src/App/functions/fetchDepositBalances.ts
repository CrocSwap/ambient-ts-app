import { CrocEnv } from '@crocswap-libs/sdk';
import { GRAPHCACHE_SMALL_URL } from '../../constants';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { IDepositedTokenBalance } from './fetchTokenBalances';

interface IFetchDepositBalancesProps {
    chainId: string;
    user: string;
    crocEnv: CrocEnv;
    graphCacheUrl: string;
    cachedTokenDetails: FetchContractDetailsFn;
}

export async function fetchDepositBalances(
    props: IFetchDepositBalancesProps,
): Promise<undefined | IDepositedTokenBalance[]> {
    const { chainId, user } = props;

    const depositBalancesCacheEndpoint = GRAPHCACHE_SMALL_URL
        ? GRAPHCACHE_SMALL_URL + '/user_balance_tokens?'
        : props.graphCacheUrl + '/user_balance_tokens?';

    return fetch(
        depositBalancesCacheEndpoint +
            new URLSearchParams({
                chainId: chainId,
                user: user,
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            if (!json?.data?.tokens) {
                return undefined;
            }

            const tokens = json.data.tokens as string[];

            return Promise.all(tokens.map((t) => expandTokenBalance(t, props)));
        })
        .catch((e) => {
            console.warn(e);
            return undefined;
        });
}

async function expandTokenBalance(
    token: string,
    props: IFetchDepositBalancesProps,
): Promise<IDepositedTokenBalance> {
    const details = props.cachedTokenDetails(
        (await props.crocEnv.context).provider,
        token,
        props.chainId,
    );
    const symbol = details.then((d) => d?.symbol || '');
    const decimals = props.crocEnv.token(token).decimals;
    const balance = props.crocEnv.token(token).balance(props.user);

    return {
        token: token,
        symbol: await symbol,
        decimals: await decimals,
        balance: (await balance).toString(),
    };
}
