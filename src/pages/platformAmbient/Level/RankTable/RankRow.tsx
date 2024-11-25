import { RiWallet3Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useFetchBatch } from '../../../../App/hooks/useFetchBatch';
import { FlexContainer, Text } from '../../../../styled/Common';
import styles from './RankTable.module.css';

interface PropsIF {
    data: {
        rank: number | string;
        walletDisplay: string;
        userAddress: string;
        points: string;
        currentLevel: string;
    };
    userRow?: boolean;
}
export default function RankRow(props: PropsIF) {
    const { data, userRow } = props;

    const navigate = useNavigate();

    function handleWalletLinkClick() {
        navigate(`/${data.userAddress}`);
    }

    function goToLevelsPage(): void {
        navigate(`/${data.userAddress}/xp`);
    }

    /* eslint-disable-next-line camelcase */
    const body = { config_path: 'ens_address', address: data.userAddress };
    const { data: fetchBatchData, error } = useFetchBatch<'ens_address'>(body);

    let ensAddress = null;
    if (fetchBatchData && !error) {
        ensAddress = fetchBatchData.ens_address;
    }
    // -------------------

    const rank = data.rank;

    let rankStyle = '';
    switch (rank) {
        case 1:
            rankStyle = styles.first_style;
            break;
        case 2:
            rankStyle = styles.second_style;
            break;
        case 3:
            rankStyle = styles.third_style;
            break;
        default:
    }

    // --------------
    const menu = (
        <FlexContainer
            gap={4}
            padding='0 8px'
            style={{ borderLeft: '1px solid var(--dark3)' }}
            justifyContent='flex-end'
        >
            <div className={styles.menu_button} onClick={goToLevelsPage}>
                XP
            </div>
            <div className={styles.menu_button} onClick={handleWalletLinkClick}>
                <RiWallet3Line size={16} />
            </div>
        </FlexContainer>
    );

    return (
        <div
            className={`${styles.row_container} 
        ${userRow && styles.user_row}
        ${rankStyle}
        `}
        >
            <Text fontSize='body' color='text1' fontWeight='400'>
                {' '}
                {data.rank}
            </Text>
            <Text
                fontSize='body'
                color='text1'
                fontWeight='400'
                style={{ fontFamily: 'monospace' }}
            >
                {userRow ? 'you' : ensAddress || data.walletDisplay}
            </Text>
            <Text fontSize='body' color='accent5' fontWeight='400'>
                {data.points}
            </Text>
            <Text fontSize='body' color='accent5' fontWeight='400'>
                {data.currentLevel}
            </Text>

            {menu}
        </div>
    );
}
