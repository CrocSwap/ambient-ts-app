import { RiWallet3Line } from 'react-icons/ri';
import { FlexContainer, Text } from '../../../styled/Common';
import styles from './RankTable.module.css';
import { useNavigate } from 'react-router-dom';
import { useFetchBatch } from '../../../App/hooks/useFetchBatch';

interface PropsIF {
    data: {
        rank: number;
        walletDisplay: string;
        userAddress: string;
        points: string;
        currentLevel: string;
    };
}
export default function RankRow(props: PropsIF) {
    const { data } = props;

    const navigate = useNavigate();

    function handleWalletLinkClick() {
        navigate(`/account/${data.userAddress}`);
    }

    function goToLevelsPage(): void {
        navigate(`/account/${data.userAddress}/xp`);
    }

    /* eslint-disable-next-line camelcase */
    const body = { config_path: 'ens_address', address: data.userAddress };
    const { data: fetcBatchData, error } = useFetchBatch<'ens_address'>(body);

    let ensAddress = null;
    if (fetcBatchData && !error) {
        ensAddress = fetcBatchData.ens_address;
    }

    const menu = (
        <FlexContainer
            gap={4}
            padding='0 8px'
            style={{ borderLeft: '1px solid var(--dark3)' }}
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
        <div className={styles.row_container} style={{ height: '40px' }}>
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
                {ensAddress || data.walletDisplay}
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
