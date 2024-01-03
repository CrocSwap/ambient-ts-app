import { RiWallet3Line } from 'react-icons/ri';
import { FlexContainer, Text } from '../../../styled/Common';
import styles from './RankTable.module.css';
import { useNavigate } from 'react-router-dom';

interface PropsIF {
    data: {
        rank: number;
        walletDisplay: string;
        userAddress: string;
        points: string;
        currentLevel: number;
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
                {' '}
                {data.walletDisplay}
            </Text>
            <Text fontSize='body' color='accent5' fontWeight='400'>
                {' '}
                {data.points}
            </Text>
            <Text fontSize='body' color='accent5' fontWeight='400'>
                {' '}
                {data.currentLevel}
            </Text>

            {menu}
        </div>
    );
}
