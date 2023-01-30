import styles from '../SidebarSearchResults.module.css';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { getDisplayPrice, getValueUSD } from './functions/exports';

interface propsIF {
    limitOrder: LimitOrderIF;
    isDenomBase: boolean;
}

export default function OrderSearchResult(props: propsIF) {
    const { limitOrder, isDenomBase } = props;

    const symbols = {
        base: limitOrder.baseSymbol ? getUnicodeCharacter(limitOrder.baseSymbol) : '',
        quote: limitOrder.quoteSymbol ? getUnicodeCharacter(limitOrder.quoteSymbol) : '',
    };

    const displayPrice = isDenomBase
        ? getDisplayPrice(symbols.quote, limitOrder.invLimitPriceDecimalCorrected)
        : getDisplayPrice(symbols.base, limitOrder.limitPriceDecimalCorrected);

    const valueUSD = getValueUSD(limitOrder.totalValueUSD);

    return (
        <div className={styles.card_container}>
            <div>{limitOrder.baseSymbol} / {limitOrder.quoteSymbol}</div>
            <div>{displayPrice}</div>
            <div>{valueUSD}</div>
        </div>
    );
}