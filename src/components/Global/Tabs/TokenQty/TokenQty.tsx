import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import styles from './TokenQty.module.css';

interface TokenQtyProps {
    baseToken?: TokenIF;
    quoteToken?: TokenIF;
    baseQty?: string;
    quoteQty?: string;
}

export default function TokenQty(props: TokenQtyProps) {
    const { baseToken, quoteToken, baseQty, quoteQty } = props;

    const baseTokenCharacter = baseToken ? getUnicodeCharacter(baseToken?.symbol) : null;
    const quoteTokenCharacter = quoteToken ? getUnicodeCharacter(quoteToken?.symbol) : null;

    const baseDisplay = (
        <section className={styles.qty_sing}>
            {baseTokenCharacter} <p>{baseQty}</p>
            {/* <img src={baseToken ? baseToken.logoURI : undefined} alt='' /> */}
        </section>
    );

    const quoteDisplay = (
        <section className={styles.qty_sing}>
            {quoteTokenCharacter}
            <p>{quoteQty}</p>
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
