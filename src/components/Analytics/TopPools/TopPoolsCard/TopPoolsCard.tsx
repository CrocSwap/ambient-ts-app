import styles from './TopPoolsCard.module.css';

interface TopPoolsCardProp {
    number: number;
    // eslint-disable-next-line
    pair: any;

    searchInput?: string;
}
export default function TopPoolsCard(props: TopPoolsCardProp) {
    const firstPair = props.pair[0];
    const secondPair = props.pair[1];
    return (
        <div className={styles.container}>
            <div>{props.number}</div>
            <div className={styles.token_info}>
                <div>
                    <img
                        src={firstPair?.logoURI}
                        alt=''
                        width='25px'
                        style={{ borderRadius: '50%' }}
                    />
                    <img
                        src={secondPair?.logoURI}
                        alt=''
                        width='25px'
                        style={{ borderRadius: '50%' }}
                    />
                </div>
                <p>
                    {props.searchInput == '' ? firstPair?.symbol : props.searchInput}/
                    {secondPair?.symbol}
                </p>
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
