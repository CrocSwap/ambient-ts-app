import { IS_LOCAL_ENV } from '../../constants';
import { IDepositedTokenBalance } from './fetchTokenBalances';

interface IFetchDepositBalancesProps {
    chainId: string;
    user: string;
}
/**
 * Fetches deposit balances of the given user on the given chain from a cache endpoint.
 * @param props - An object containing chainId and user address to fetch deposit balances for.
 * @returns A Promise that resolves to an object containing chainId, network name, user address, block number and an array of token balances, or undefined if the request fails.
 */
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
    // Construct the endpoint URL for deposit balance cache

    const depositBalancesCacheEndpoint =
        'https://809821320828123.de:5000' + '/user_balances?';
    // Debug message for local environments

    IS_LOCAL_ENV && console.debug('fetching deposit balances');
    // Fetch deposit balances from the cache endpoint

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
