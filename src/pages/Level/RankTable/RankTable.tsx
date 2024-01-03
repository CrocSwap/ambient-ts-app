import { useContext } from 'react';
import Divider from '../../../components/Global/Divider/Divider';
import { XpLeadersContext } from '../../../contexts/XpLeadersContext';
import RankHeader from './RankHeader';
import RankRow from './RankRow';
import styles from './RankTable.module.css';
import { trimString } from '../../../ambient-utils/dataLayer';

export default function RankTable() {
    const { xpLeadersData } = useContext(XpLeadersContext);
    const formattedData =
        xpLeadersData?.data?.map((entry) => ({
            rank: entry.leaderboardRank,
            wallet: trimString(entry.userAddress ?? '', 6, 6, '…'),
            points: entry.totalPoints.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }),
            currentLevel: entry.currentLevel,
        })) || [];

    return (
        <div className={styles.main_table}>
            <RankHeader />
            <Divider />
            <div className={styles.main_table_content}>
                {formattedData.map((data, idx) => (
                    <RankRow key={idx} data={data} />
                ))}
            </div>
        </div>
    );
}
