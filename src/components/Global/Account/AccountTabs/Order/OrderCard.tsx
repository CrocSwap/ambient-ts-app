import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { formatAmountOld } from '../../../../../utils/numbers';
// import OpenOrderStatus from '../../../../Global/OpenOrderStatus/OpenOrderStatus';
// import Price from '../../../../Global/Tabs/Price/Price';
import TokenQty from '../../../../Global/Tabs/TokenQty/TokenQty';
import OpenOrderStatus from '../../../OpenOrderStatus/OpenOrderStatus';
import AccountPoolDisplay from '../../../Tabs/AccountPoolDisplay/AccountPoolDisplay';
import AccountTokensDisplay from '../../../Tabs/AccountTokensDisplay/AccountTokensDisplay';
// import OrderTypeSide from '../../../../Global/Tabs/TypeAndSide/OrderTypeAndSide/OrderTypeSide';
// import WalletAndId from '../../../../Global/Tabs/WalletAndID/WalletAndId';
// import RangeStatus from '../../../RangeStatus/RangeStatus';
// import AccountPoolDisplay from '../../../Tabs/AccountPoolDisplay/AccountPoolDisplay';
import Price from '../../../Tabs/Price/Price';
// import RangeMinMax from '../../../Tabs/RangeMinMax/RangeMinMax';
// import AccountPoolDisplay from '../../../Tabs/AccountPoolDisplay/AccountPoolDisplay';
// import OrdersMenu from '../../../Tabs/TableMenu/TableMenuComponents/OrdersMenu';
import OrderTypeSide from '../../../Tabs/TypeAndSide/OrderTypeAndSide/OrderTypeSide';
import Value from '../../../Tabs/Value/Value';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';

import styles from './OrderCard.module.css';

interface propsIF {
    limitOrder: LimitOrderIF;
    isDenomBase: boolean;
}

export default function OrderCard(props: propsIF) {
    const { limitOrder, isDenomBase } = props;

    const baseTokenLogoURI = limitOrder.baseTokenLogoURI;
    const quoteTokenLogoURI = limitOrder.quoteTokenLogoURI;

    const baseTokenSymbol = limitOrder.baseSymbol;
    const quoteTokenSymbol = limitOrder.quoteSymbol;

    const baseTokenCharacter = limitOrder.baseSymbol
        ? getUnicodeCharacter(limitOrder.baseSymbol)
        : '';
    const quoteTokenCharacter = limitOrder.quoteSymbol
        ? getUnicodeCharacter(limitOrder.quoteSymbol)
        : '';
    //   const priceDecimalCorrected = limitOrder.limitPriceDecimalCorrected;
    const invPriceDecimalCorrected = limitOrder.invLimitPriceDecimalCorrected;

    const invertedPriceTruncated =
        invPriceDecimalCorrected === 0
            ? '0.00'
            : invPriceDecimalCorrected < 0.0001
            ? invPriceDecimalCorrected.toExponential(2)
            : invPriceDecimalCorrected < 2
            ? invPriceDecimalCorrected.toPrecision(3)
            : invPriceDecimalCorrected >= 100000
            ? formatAmountOld(invPriceDecimalCorrected)
            : invPriceDecimalCorrected.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const truncatedDisplayPrice = quoteTokenCharacter + invertedPriceTruncated;

    const priceType = !limitOrder.isBid ? 'priceBuy' : 'priceSell';

    const sideType = !limitOrder.isBid ? 'buy' : 'sell';

    const liqBaseNum = limitOrder.positionLiqBaseDecimalCorrected;
    const liqQuoteNum = limitOrder.positionLiqQuoteDecimalCorrected;

    const baseQtyTruncated =
        liqBaseNum === 0
            ? '0'
            : liqBaseNum < 0.0001
            ? liqBaseNum.toExponential(2)
            : liqBaseNum < 2
            ? liqBaseNum.toPrecision(3)
            : liqBaseNum >= 100000
            ? formatAmountOld(liqBaseNum)
            : // ? baseLiqDisplayNum.toExponential(2)
              liqBaseNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });
    const quoteQtyTruncated =
        liqQuoteNum === 0
            ? '0'
            : liqQuoteNum < 0.0001
            ? liqQuoteNum.toExponential(2)
            : liqQuoteNum < 2
            ? liqQuoteNum.toPrecision(3)
            : liqQuoteNum >= 100000
            ? formatAmountOld(liqQuoteNum)
            : // ? baseLiqDisplayNum.toExponential(2)
              liqQuoteNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const usdValueNum = limitOrder.totalValueUSD;
    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.0001
        ? usdValueNum.toExponential(2)
        : usdValueNum < 2
        ? usdValueNum.toPrecision(3)
        : usdValueNum >= 10000
        ? formatAmountOld(usdValueNum, 1)
        : // ? baseLiqDisplayNum.toExponential(2)
          usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    return (
        <div className={styles.main_container}>
            <div className={styles.tokens_container}>
                <AccountTokensDisplay
                    baseTokenLogoURI={baseTokenLogoURI}
                    quoteTokenLogoURI={quoteTokenLogoURI}
                />
            </div>
            <div className={styles.row_container}>
                <AccountPoolDisplay
                    baseTokenSymbol={baseTokenSymbol}
                    quoteTokenSymbol={quoteTokenSymbol}
                />
                {/* ------------------------------------------------------ */}
                <Price priceType={priceType} displayPrice={truncatedDisplayPrice} />
                {/* ------------------------------------------------------ */}
                <OrderTypeSide
                    type='order'
                    side={sideType}
                    isDenomBase={isDenomBase}
                    baseTokenCharacter={baseTokenCharacter}
                    quoteTokenCharacter={quoteTokenCharacter}
                />
                {/* ------------------------------------------------------ */}
                <Value usdValue={usdValueTruncated ? '$' + usdValueTruncated : '…'} />
                <TokenQty
                    baseQty={baseQtyTruncated}
                    quoteQty={quoteQtyTruncated}
                    baseTokenCharacter={baseTokenCharacter}
                    quoteTokenCharacter={quoteTokenCharacter}
                />
                {/* ------------------------------------------------------ */}
                <div className={styles.status}>
                    <OpenOrderStatus isFilled={!limitOrder.positionLiq} />
                </div>
            </div>
        </div>
    );
}
