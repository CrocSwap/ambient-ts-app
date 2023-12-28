import Divider from '../../../components/Global/Divider/Divider';
import RankHeader from './RankHeader';
import RankRow from './RankRow';
import styles from './RankTable.module.css';

export default function RankTable() {
    return (
        <div className={styles.main_table}>
            <RankHeader />
            <Divider />
            <div className={styles.main_table_content}>
                {mockupData.map((data, idx) => (
                    <RankRow key={idx} data={data} />
                ))}
            </div>
        </div>
    );
}

const mockupData = [
    {
        rank: 1,
        wallet: '0xAbCd...9876',
        points: '$100.65k',
    },
    {
        rank: 2,
        wallet: '0xEfGh...5432',
        points: '$90.23k',
    },
    {
        rank: 3,
        wallet: '0xIjKl...2109',
        points: '$80.12k',
    },
    {
        rank: 4,
        wallet: '0xMnOp...8765',
        points: '$70.45k',
    },
    {
        rank: 5,
        wallet: '0xQrSt...4321',
        points: '$65.78k',
    },
    {
        rank: 6,
        wallet: '0xUvWx...9870',
        points: '$60.34k',
    },
    {
        rank: 7,
        wallet: '0xYzAb...5439',
        points: '$55.21k',
    },
    {
        rank: 8,
        wallet: '0xCdEf...1098',
        points: '$50.89k',
    },
    {
        rank: 9,
        wallet: '0xGhIj...7654',
        points: '$45.67k',
    },
    {
        rank: 10,
        wallet: '0xKlMn...3210',
        points: '$40.12k',
    },
    {
        rank: 11,
        wallet: '0xOpQr...8765',
        points: '$38.90k',
    },
    {
        rank: 12,
        wallet: '0xStUv...4321',
        points: '$36.78k',
    },
    {
        rank: 13,
        wallet: '0xWxYz...1098',
        points: '$34.56k',
    },
    {
        rank: 14,
        wallet: '0xAaBb...7654',
        points: '$32.34k',
    },
    {
        rank: 15,
        wallet: '0xBbCc...3210',
        points: '$30.12k',
    },
    {
        rank: 16,
        wallet: '0xCcDd...8765',
        points: '$28.90k',
    },
    {
        rank: 17,
        wallet: '0xDdEe...4321',
        points: '$26.78k',
    },
    {
        rank: 18,
        wallet: '0xEeFf...1098',
        points: '$24.56k',
    },
    {
        rank: 19,
        wallet: '0xFfGg...7654',
        points: '$22.34k',
    },
    {
        rank: 20,
        wallet: '0xGgHh...3210',
        points: '$20.12k',
    },
    // Add more data objects as needed
];
