import { Text } from '../../../styled/Common';
import styles from './RankTable.module.css';

export default function RankHeader() {
    return (
        <div className={styles.row_container_header} style={{ height: '16px' }}>
            <Text fontSize='body' color='text2'>
                {' '}
                Rank
            </Text>
            <Text fontSize='body' color='text2'>
                {' '}
                Wallet
            </Text>
            <Text fontSize='body' color='text2'>
                {' '}
                Points
            </Text>
            <Text fontSize='body' color='text2'>
                {' '}
                Level
            </Text>
            <span />
        </div>
    );
}
