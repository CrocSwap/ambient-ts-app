import styles from './RecentToken.module.css';

export default function RecentToken() {
    return (
        <div className={styles.recent_token}>
            <img
                src={
                    'https://w7.pngwing.com/pngs/268/1013/png-transparent-ethereum-eth-hd-logo.png'
                }
                alt={'altText'}
                className={styles.token_logo}
                width='30px'
            />
            <span>{'ETH'}</span>
        </div>
    );
}
