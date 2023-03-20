import styles from './TopTokensCard.module.css';

interface TopTokensCardProp {
    number: number;
    img: string;
    symbol: string;
    name: string;
}
export default function TopTokensCard(props: TopTokensCardProp) {
    return (
        <div className={styles.container}>
            <div>{props.number}</div>
            <div className={styles.token_info}>
                <img src={props.img} alt='' width='25px' style={{ borderRadius: '50%' }} />
                <p>{props.name}</p>
                <p>{props.symbol}</p>
            </div>
            <div>$1.00</div>
            <div>0.00%</div>
            <div>$597.36m</div>
            <div>$1.17b</div>
        </div>
    );
}
