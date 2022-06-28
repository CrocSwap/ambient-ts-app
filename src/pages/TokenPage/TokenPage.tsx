import { Card } from '@material-ui/core';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import Divider from '../../components/Global/Divider/Divider';
import Pools from '../../components/Pools/Pools';
import { useActiveNetworkVersion } from '../../state/application/hooks';
import { useAllPoolData, usePoolDatas } from '../../state/pools/hooks';
import {
    usePoolsForToken,
    useTokenChartData,
    useTokenData,
    useTokenTransactions,
} from '../../state/tokens/hooks';
import { notEmpty } from '../../utils';
import { formatDollarAmount } from '../../utils/numbers';
import Transactions from '../Transactions/Transactions';
import TotalCardInfo from './TokenInfoCard/TokenInfoCard';
import styles from './TokenPage.module.css';

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
            <Transactions transactions={transactions!} />
        </main>
    );
}
