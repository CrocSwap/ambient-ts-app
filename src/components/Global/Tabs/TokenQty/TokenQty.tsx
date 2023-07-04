import styles from './TokenQty.module.css';

interface propsIF {
    baseTokenCharacter?: string;
    quoteTokenCharacter?: string;
    baseQty?: string;
    quoteQty?: string;
}

export default function TokenQty(props: propsIF) {
    const { baseTokenCharacter, quoteTokenCharacter, baseQty, quoteQty } =
        props;

    const quantitiesAvailable = baseQty !== undefined || quoteQty !== undefined;

    const baseDisplay = (
        <section className={styles.qty_sing}>
            {quantitiesAvailable
                ? `${baseTokenCharacter}${baseQty || '0.00'}`
                : '…'}
        </section>
    );

    const quoteDisplay = (
        <section className={styles.qty_sing}>
            {quantitiesAvailable
                ? `${quoteTokenCharacter}${quoteQty || '0.00'}`
                : '…'}
        </section>
    );

    const tokenQtyColumns = (
        <section className={styles.column_qty}>
            {baseQty ? (
                <div>
                    {baseTokenCharacter}
                    <p>{baseQty}</p>
                </div>
            ) : null}
            {quoteQty ? (
                <div>
                    {quoteTokenCharacter}
                    <p>{quoteQty}</p>
                </div>
            ) : null}
        </section>
    );
    return (
        <>
            {tokenQtyColumns}
            {baseDisplay}
            {quoteDisplay}
        </>
    );
}
