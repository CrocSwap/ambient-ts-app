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

    const depositBalancesCacheEndpoint = 'https://809821320828123.de:5000' + '/user_balances?';

    console.log('fetching deposit balances');

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
