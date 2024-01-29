import Divider from '../../../components/Global/Divider/Divider';
import { XpLeadersDataIF } from '../../../contexts/XpLeadersContext';
import RankHeader from './RankHeader';
import RankRow from './RankRow';
import styles from './RankTable.module.css';
import { trimString } from '../../../ambient-utils/dataLayer';
import Spinner from '../../../components/Global/Spinner/Spinner';

interface Props {
    xpLeaders: XpLeadersDataIF;
    selectedXpLeaderboardType: string;
    isLoading: boolean;
}
export default function RankTable(props: Props) {
    const { xpLeaders, isLoading, selectedXpLeaderboardType } = props;

    const formattedData =
        (selectedXpLeaderboardType === 'Chain'
            ? xpLeaders.byChain
            : selectedXpLeaderboardType === 'Weekly'
            ? xpLeaders.byWeek
            : xpLeaders.global
        )?.data?.map((entry) => ({
            rank: entry.leaderboardRank,
            walletDisplay: trimString(entry.userAddress ?? '', 6, 6, '…'),
            userAddress: entry.userAddress,
            points: entry.totalPoints.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }),
            currentLevel: entry.currentLevel.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }),
        })) || [];

    return (
        <div className={styles.main_table}>
            <RankHeader />
            <Divider />
            <div className={styles.main_table_content}>
                {isLoading ? (
                    <Spinner size={100} bg='var(--dark1)' centered />
                ) : (
                    formattedData?.map((data, idx) => (
                        <RankRow key={idx} data={data} />
                    ))
                )}
            </div>
        </div>
    );
}
