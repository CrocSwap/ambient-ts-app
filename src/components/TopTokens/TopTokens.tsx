import { useCallback, useMemo, useState } from 'react';
import { TOKEN_HIDE } from '../../constants';
import { TokenData } from '../../state/tokens/models';
import TokenCardHeader from './TokenCardHeader';
import TopTokenRow from './TopTokenRow';
import styles from './TopTokens.module.css';

interface TokenProps {
    tokens: TokenData[];
}

export const SORT_FIELD = {
    name: 'name',
    volumeUSD: 'volumeUSD',
    tvlUSD: 'tvlUSD',
    priceUSD: 'priceUSD',
    priceUSDChange: 'priceUSDChange',
    priceUSDChangeWeek: 'priceUSDChangeWeek',
};

export default function TopTokens(props: TokenProps) {
    const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD);
    const [sortDirection, setSortDirection] = useState<boolean>(true);

    const tokens = props.tokens;
    const sortedTokens = useMemo(() => {
        return tokens
            ? tokens
                  .filter((x) => !!x && !TOKEN_HIDE.includes(x.address))
                  .sort((a, b) => {
                      if (a && b) {
                          return a[sortField as keyof TokenData] > b[sortField as keyof TokenData]
                              ? (sortDirection ? -1 : 1) * 1
                              : (sortDirection ? -1 : 1) * -1;
                      } else {
                          return -1;
                      }
                  })
            : [];
    }, [tokens, sortDirection, sortField]);

    const handleSort = useCallback(
        (newField: string) => {
            setSortField(newField);
            setSortDirection(sortField !== newField ? true : !sortDirection);
        },
        [sortDirection, sortField],
    );

    const arrow = useCallback(
        (field: string) => {
            return sortField === field ? (!sortDirection ? '↑' : '↓') : '';
        },
        [sortDirection, sortField],
    );

    const topTokensDisplay = sortedTokens.map((topToken, idx) => (
        <TopTokenRow token={topToken} key={idx} index={idx + 1} />
    ));

    return (
        <div className={styles.container}>
            <div className={styles.container}>
                <TokenCardHeader arrow={arrow} sort={handleSort} />
                {topTokensDisplay}
            </div>
        </div>
    );
}
