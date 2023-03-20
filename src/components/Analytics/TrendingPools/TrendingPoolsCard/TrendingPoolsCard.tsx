import styles from './TrendingPoolsCard.module.css';

interface TrendingPoolsCardProp {
    number: number;
}
export default function TrendingPoolsCard(props: TrendingPoolsCardProp) {
    return (
        <div className={styles.container}>
            <div>{props.number}</div>
            <div className={styles.token_info}>
                <div>
                    <img
                        src={'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'}
                        alt=''
                        width='25px'
                    />
                    <img
                        src={'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'}
                        alt=''
                        width='25px'
                    />
                </div>
                <p>DAI/USDC</p>
                <p>0.01%</p>
            </div>
            <div>$809.96m</div>
            <div>$1.00</div>
            <div>0.00%</div>
            <div>$597.36m</div>
            <div>0.10</div>
        </div>
    );
}
