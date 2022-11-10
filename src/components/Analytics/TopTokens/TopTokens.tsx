import styles from './TopTokens.module.css';
import TopTokensCard from './TopTokensCard/TopTokensCard';
import TopTokensHeader from './TopTokensHeader/TopTokensHeader';
import { uniswapTokens } from '../fakedata/uniswapTokens';
import { motion } from 'framer-motion';
// import AnalyticsTokenRows from '../AnalyticsTokenRows/AnalyticsTokenRows';
const tokenData = uniswapTokens[0].tokens;
import { Dispatch, SetStateAction } from 'react';
import AnalyticsTokenScrolls from '../AnalyticsTokenScrolls/AnalyticsTokenScrolls';
interface TopTokensPropsIF {
    analyticsSearchInput: string;
    setAnalyticsSearchInput: Dispatch<SetStateAction<string>>;
}
export default function TopTokens(props: TopTokensPropsIF) {
    const { analyticsSearchInput } = props;
    const exampleSearch = (
        <div className={styles.item_container}>
            {tokenData.slice(0, 2).map((token, idx) => (
                <TopTokensCard
                    name={analyticsSearchInput}
                    img={token.logoURI}
                    symbol={analyticsSearchInput}
                    key={idx}
                    number={idx + 1}
                />
            ))}
        </div>
    );
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
        <motion.div
            className={styles.main_container}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* {analyticsSearchInput == '' && <AnalyticsTokenRows />} */}
            {analyticsSearchInput == '' && <AnalyticsTokenScrolls />}
            <p>All Tokens</p>
            <TopTokensHeader />
            {analyticsSearchInput !== '' ? exampleSearch : container}
        </motion.div>
    );
}
