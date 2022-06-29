import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Divider from '../../components/Global/Divider/Divider';
import Pools from '../../components/Pools/Pools';

import {
    usePoolsForToken,
    useTokenChartData,
    useTokenData,
    useTokenTransactions,
} from '../../state/tokens/hooks';

import TotalCardInfo from './TokenInfoCard/TokenInfoCard';
import styles from './TokenPage.module.css';
import { usePoolDatas } from '../../state/pools/hooks';
import Transactions from '../Transactions/Transactions';
import { isAddress } from '../../utils';

export default function TokenPage() {
    const { address } = useParams();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const tokenData = useTokenData(address);
    const poolsForToken = usePoolsForToken(address!);
    const poolDatas = usePoolDatas(poolsForToken ?? []);
    const transactions = useTokenTransactions(address!);
    const chartData = useTokenChartData(address!);

    function getTokenLogoURL() {
        const checkSummed = isAddress(tokenData!.address);
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checkSummed}/logo.png`;
    }

    const tokenInfo = (
        <div className={styles.token_info_container}>
            <div className={styles.tokens_info}>
                <div className={styles.tokens_images}>
                    <img
                        className={styles.token_list}
                        src={getTokenLogoURL()}
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = '/question.svg';
                        }}
                        alt='token'
                        width='30px'
                    />
                </div>
                <span className={styles.tokens_name}>
                    {' '}
                    {tokenData!.name} ({tokenData!.symbol})
                </span>
            </div>
        </div>
    );

    return (
        <main data-testid={'token-page'} className={styles.pools_container}>
            {tokenInfo}
            <TotalCardInfo token={tokenData} />
            <Divider />
            <h2>Pools</h2>
            <Pools pools={poolDatas} propType='all' maxItems={10} />
            {/* <Transactions transactions={transactions!} /> */}
        </main>
    );
}
