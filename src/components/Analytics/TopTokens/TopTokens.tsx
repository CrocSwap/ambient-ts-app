import styles from './TopTokens.module.css';
import TopTokensCard from './TopTokensCard/TopTokensCard';
import TopTokensHeader from './TopTokensHeader/TopTokensHeader';
import { uniswapTokens } from '../fakedata/uniswapTokens';

const tokenData = uniswapTokens[0].tokens;

export default function TopTokens() {
    const container = (
        <div className={styles.item_container}>
            {tokenData.slice(0, 12).map((token, idx) => (
                <TopTokensCard
                    name={token.name}
                    img={token.logoURI}
                    symbol={token.symbol}
                    key={idx}
                    number={idx + 1}
                />
            ))}
        </div>
    );
    return (
        <div className={styles.main_container}>
            <p>All Tokens</p>

            <TopTokensHeader />
            {container}
        </div>
    );
}
