import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
// import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import styles from './TokenQty.module.css';

interface TokenQtyProps {
    baseTokenSymbol?: string;
    quoteTokenSymbol?: string;
    baseQty?: string;
    quoteQty?: string;
}

export default function TokenQty(props: TokenQtyProps) {
    const { baseTokenSymbol, quoteTokenSymbol, baseQty, quoteQty } = props;

    const baseTokenCharacter = baseTokenSymbol ? getUnicodeCharacter(baseTokenSymbol) : '';
    const quoteTokenCharacter = quoteTokenSymbol ? getUnicodeCharacter(quoteTokenSymbol) : '';

    const baseDisplay = (
        <section className={styles.qty_sing}>
            {baseQty ? `${baseTokenCharacter}${baseQty}` : '...'}
            {/* {baseTokenCharacter} <p>{baseQty}</p> */}
            {/* <img src={baseToken ? baseToken.logoURI : undefined} alt='' /> */}
        </section>
    );

    const quoteDisplay = (
        <section className={styles.qty_sing}>
            {quoteQty ? `${quoteTokenCharacter}${quoteQty}` : '...'}

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
