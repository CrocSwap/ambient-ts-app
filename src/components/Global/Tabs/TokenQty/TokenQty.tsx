// import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import styles from './TokenQty.module.css';

interface TokenQtyProps {
    baseTokenCharacter?: string;
    quoteTokenCharacter?: string;
    baseQty?: string;
    quoteQty?: string;
}

export default function TokenQty(props: TokenQtyProps) {
    const { baseTokenCharacter, quoteTokenCharacter, baseQty, quoteQty } = props;

    const quantitiesAvailable = baseQty !== undefined || quoteQty !== undefined;

    const baseDisplay = (
        <section className={styles.qty_sing}>
            {quantitiesAvailable ? `${baseTokenCharacter}${baseQty || '0.00'}` : '…'}
            {/* {baseTokenCharacter} <p>{baseQty}</p> */}
            {/* <img src={baseToken ? baseToken.logoURI : undefined} alt='' /> */}
        </section>
    );

    const quoteDisplay = (
        <section className={styles.qty_sing}>
            {quantitiesAvailable ? `${quoteTokenCharacter}${quoteQty || '0.00'}` : '…'}

            {/* {quoteTokenCharacter}<p>{quoteQty}</p> */}
            {/* <img src={quoteToken ? quoteToken.logoURI : undefined} alt='' /> */}
        </section>
    );

    const tokenQtyColumns = (
        <section className={styles.column_qty}>
            {baseQty ? (
                <div>
                    {baseTokenCharacter}
                    <p>{baseQty}</p>
                    {/* <img src={baseToken ? baseToken.logoURI : undefined} alt='' /> */}
                </div>
            ) : null}
            {quoteQty ? (
                <div>
                    {quoteTokenCharacter}
                    <p>{quoteQty}</p>
                    {/* <img src={quoteToken ? quoteToken.logoURI : undefined} alt='' /> */}
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
