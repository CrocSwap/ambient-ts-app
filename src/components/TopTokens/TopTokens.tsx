import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TOKEN_HIDE } from '../../constants';
import { TokenData } from '../../state/tokens/reducer';
import TopTokenRow from './TopTokenRow';
import styles from './TopTokens.module.css';

interface TokenProps {
    tokens: TokenData[];
}

export default function TopTokens(props: TokenProps) {
    const SORT_FIELD = {
        name: 'name',
        volumeUSD: 'volumeUSD',
        tvlUSD: 'tvlUSD',
        priceUSD: 'priceUSD',
        priceUSDChange: 'priceUSDChange',
        priceUSDChangeWeek: 'priceUSDChangeWeek',
    };

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

    const topTokensHeader = (
        <thead>
            <tr>
                <th>#</th>
                <th style={{ width: 350 }}>
                    <label onClick={() => handleSort(SORT_FIELD.name)}>
                        Name {arrow(SORT_FIELD.name)}
                    </label>
                </th>
                <th>
                    <label onClick={() => handleSort(SORT_FIELD.priceUSD)}>
                        Price {arrow(SORT_FIELD.priceUSD)}
                    </label>
                </th>
                <th>
                    <label onClick={() => handleSort(SORT_FIELD.priceUSDChange)}>
                        Price Change {arrow(SORT_FIELD.priceUSDChange)}
                    </label>
                </th>
                <th>
                    <label onClick={() => handleSort(SORT_FIELD.volumeUSD)}>
                        Volume 24H {arrow(SORT_FIELD.volumeUSD)}
                    </label>
                </th>
                <th>
                    <label onClick={() => handleSort(SORT_FIELD.tvlUSD)}>
                        TVL {arrow(SORT_FIELD.tvlUSD)}
                    </label>
                </th>
            </tr>
        </thead>
    );

    return (
        <div className={styles.topToken_table_display}>
            <table>
                {topTokensHeader}

                <tbody>{topTokensDisplay}</tbody>
            </table>
        </div>
    );
}
