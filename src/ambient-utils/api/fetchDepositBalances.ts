import { CrocEnv } from '@crocswap-libs/sdk';
import { GCGO_OVERRIDE_URL } from '../constants';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { IDepositedTokenBalance } from './fetchTokenBalances';
import { TokenIF } from '../types';

interface IFetchDepositBalancesProps {
    chainId: string;
    user: string;
    crocEnv: CrocEnv;
    graphCacheUrl: string;
    cachedTokenDetails: FetchContractDetailsFn;
    tokenList: TokenIF[];
}

export async function fetchDepositBalances(
    props: IFetchDepositBalancesProps,
): Promise<undefined | IDepositedTokenBalance[]> {
    const { chainId, user } = props;

    const depositBalancesCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/user_balance_tokens?'
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
    const tokenListedSymbol = props.tokenList.find(
        (listedToken) =>
            listedToken.address.toLowerCase() === token.toLowerCase(),
    )?.symbol;

    const tokenListedDecimals = props.tokenList.find(
        (listedToken) =>
            listedToken.address.toLowerCase() === token.toLowerCase(),
    )?.decimals;

    const symbol = tokenListedSymbol
        ? tokenListedSymbol
        : props
              .cachedTokenDetails(
                  (await props.crocEnv.context).provider,
                  token,
                  props.chainId,
              )
              .then((d) => d?.symbol || '');

    const decimals = tokenListedDecimals
        ? tokenListedDecimals
        : props.crocEnv.token(token).decimals;
    const balance = props.crocEnv.token(token).balance(props.user);

    return {
        token: token,
        symbol: await symbol,
        decimals: await decimals,
        balance: (await balance).toString(),
    };
}
