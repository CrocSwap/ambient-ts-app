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

    return (
        <main data-testid={'token-page'} className={styles.pools_container}>
            <TotalCardInfo token={tokenData} />
            <Divider />
            <h2>Pools</h2>
            <Pools pools={poolDatas} propType='all' maxItems={10} />
            {/* <Transactions transactions={transactions!} /> */}
        </main>
    );
}
