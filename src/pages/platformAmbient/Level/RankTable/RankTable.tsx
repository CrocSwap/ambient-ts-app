import { trimString } from '../../../../ambient-utils/dataLayer';
import Divider from '../../../../components/Global/Divider/Divider';
import Spinner from '../../../../components/Global/Spinner/Spinner';
import { UserXpDataIF } from '../../../../contexts/UserDataContext';
import { XpLeadersDataIF } from '../../../../contexts/XpLeadersContext';
import RankHeader from './RankHeader';
import RankRow from './RankRow';
import styles from './RankTable.module.css';
// import{ useContext } from 'react';
// import{ UserDataContext } from '../../../contexts/UserDataContext';

interface Props {
    xpLeaders: XpLeadersDataIF;
    selectedXpLeaderboardType: string;
    isLoading: boolean;
    connectedUserXp: UserXpDataIF;
}
export default function RankTable(props: Props) {
    const { xpLeaders, isLoading, selectedXpLeaderboardType, connectedUserXp } =
        props;
    // const { userAddress, isUserConnected } = useContext(UserDataContext);

    // const accountAddress = isUserConnected && userAddress ? userAddress : ''
    // const userXpEntry = xpLeaders.global?.data?.find((entry) => entry.userAddress === accountAddress);

    const formattedData =
        (selectedXpLeaderboardType === 'Chain'
            ? xpLeaders.byChain
            : selectedXpLeaderboardType === 'Weekly'
              ? xpLeaders.byWeek
              : xpLeaders.global
        )?.data?.map((entry) => ({
            rank: entry.weeklyRank ?? entry.chainRank ?? entry.globalRank ?? 0,
            walletDisplay: trimString(entry.userAddress ?? '', 6, 6, '…'),
            userAddress: entry.userAddress,
            points: (
                entry.weeklyPoints ??
                entry.chainPoints ??
                entry.globalPoints ??
                0
            ).toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }),
            currentLevel: entry.currentLevel.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }),
        })) || [];

    const formattedConnectedUserData =
        connectedUserXp.data !== undefined
            ? {
                  rank:
                      selectedXpLeaderboardType === 'Weekly'
                          ? connectedUserXp.data.weeklyRank
                              ? connectedUserXp.data.weeklyRank
                              : '-'
                          : selectedXpLeaderboardType === 'Chain'
                            ? connectedUserXp.data.chainRank
                                ? connectedUserXp.data.chainRank
                                : '-'
                            : connectedUserXp.data.globalRank
                              ? connectedUserXp.data.globalRank
                              : '-',
                  walletDisplay: trimString(
                      connectedUserXp.data.userAddress ?? '',
                      6,
                      6,
                      '…',
                  ),
                  userAddress: connectedUserXp.data.userAddress,
                  points: (selectedXpLeaderboardType === 'Weekly'
                      ? (connectedUserXp.data.weeklyPoints ?? 0)
                      : selectedXpLeaderboardType === 'Chain'
                        ? (connectedUserXp.data.chainPoints ?? 0)
                        : (connectedUserXp.data.globalPoints ?? 0)
                  ).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                  }),
                  currentLevel:
                      connectedUserXp.data.currentLevel.toLocaleString(
                          'en-US',
                          {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          },
                      ),
              }
            : undefined;

    return (
        <div className={styles.main_table}>
            <RankHeader />
            <Divider />
            <div
                className={`${styles.main_table_content} custom_scroll_ambient`}
            >
                {isLoading ? (
                    <Spinner size={100} bg='var(--dark1)' centered />
                ) : formattedConnectedUserData !== undefined ? (
                    <div>
                        {<RankRow data={formattedConnectedUserData} userRow />}
                        {formattedData?.map((data, idx) => (
                            <RankRow key={idx} data={data} />
                        ))}
                    </div>
                ) : (
                    <div>
                        {formattedData?.map((data, idx) => (
                            <RankRow key={idx} data={data} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
