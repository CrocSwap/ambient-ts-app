import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../../constants';
import { IDepositedTokenBalance } from './fetchTokenBalances';

interface IFetchDepositBalancesProps {
    chainId: string;
    user: string;
}

export const fetchDepositBalances = (
    props: IFetchDepositBalancesProps,
): Promise<
    | {
          chainId: string;
          network: string;
          user: string;
          block: number;
          tokens: IDepositedTokenBalance[];
      }
    | undefined
> => {
    const { chainId, user } = props;

    const depositBalancesCacheEndpoint = GRAPHCACHE_URL + '/user_balances?';

    IS_LOCAL_ENV && console.debug('fetching deposit balances');

    const depositBalances = fetch(
        depositBalancesCacheEndpoint +
            new URLSearchParams({
                chainId: chainId,
                user: user,
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const depositBalanceJsonData = json?.data as {
                chainId: string;
                network: string;
                user: string;
                block: number;
                tokens: IDepositedTokenBalance[];
            };
            return depositBalanceJsonData;
        })
        .catch(() => {
            return undefined;
        });

    return depositBalances;
};
