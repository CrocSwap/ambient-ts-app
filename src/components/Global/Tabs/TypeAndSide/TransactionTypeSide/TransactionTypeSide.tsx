import styles from './TransactionTypeSide.module.css';

interface TransactionTypeSideProps {
    type: 'remove' | 'buy' | 'add' | 'sell' | 'claim';
    side: 'rangeRemove' | 'rangeAdd' | 'limit' | 'market';
    baseTokenCharacter?: string;
    quoteTokenCharacter?: string;
    isDenomBase?: boolean;
}
export default function TransactionTypeSide(props: TransactionTypeSideProps) {
    const { type, side, isDenomBase, baseTokenCharacter, quoteTokenCharacter } = props;

    const removeType = <p className={styles.remove_style}>Remove</p>;
    const claimType = <p className={styles.claim_style}>Claimed</p>;

    const buyType = (
        <p className={styles.buy_style}>
            Buy {isDenomBase ? baseTokenCharacter : quoteTokenCharacter}
        </p>
    );
    const addType = <p className={styles.add_style}>Add</p>;

    const sellType = (
        <p className={styles.sell_style}>
            Sell {isDenomBase ? baseTokenCharacter : quoteTokenCharacter}
        </p>
    );

    const rangeRemove = <p className={styles.range_style}>Range</p>;
    const rangeAdd = <p className={styles.range_style2}>Range</p>;
    const limitSide = <p className={styles.limit_style}>Limit</p>;
    const marketSide = <p className={styles.market_style}>Market</p>;

    const typeData = {
        remove: removeType,
        claim: claimType,
        buy: buyType,
        add: addType,
        sell: sellType,
    };

    const sideData = {
        rangeRemove: rangeRemove,
        rangeAdd: rangeAdd,
        limit: limitSide,
        market: marketSide,
    };
    return (
        <>
            <section className={styles.type_column}>
                {typeData[type]}
                {sideData[side]}
            </section>
            <section className={styles.type_sing}>{typeData[type]}</section>
            <section className={styles.side_sing}>{sideData[side]}</section>
        </>
    );
}
