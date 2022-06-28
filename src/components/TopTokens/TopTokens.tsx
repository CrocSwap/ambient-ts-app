import { TokenData } from '../../state/tokens/models';
import TopTokenRow from './TopTokenRow';
import styles from './TopTokens.module.css';

interface TokenProps {
    tokens: TokenData[];
}

export default function TopTokens(props: TokenProps) {
    const topTokensDisplay = props.tokens.map((topToken, idx) => (
        <TopTokenRow token={topToken} key={idx} index={idx + 1} />
    ));

    const topTokensHeader = (
        <thead>
            <tr>
                <th></th>
                <th>Name</th>
                <th>Price</th>
                <th>Price Change</th>
                <th>Volume 24H</th>
                <th>TVL</th>
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
