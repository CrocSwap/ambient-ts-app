import { useEffect, useState } from 'react';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { formatAmount } from '../../../../utils/numbers';
import { ILimitOrderState } from '../../../../utils/state/graphDataSlice';
import OpenOrderStatus from '../../../Global/OpenOrderStatus/OpenOrderStatus';
import Price from '../../../Global/Tabs/Price/Price';
import OrdersMenu from '../../../Global/Tabs/TableMenu/TableMenuComponents/OrdersMenu';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import OrderTypeSide from '../../../Global/Tabs/TypeAndSide/OrderTypeAndSide/OrderTypeSide';
import Value from '../../../Global/Tabs/Value/Value';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './OrderCard.module.css';

interface OrderCardProps {
    account: string;
    limitOrder: ILimitOrderState;
    isDenomBase: boolean;
    selectedBaseToken: string;
    selectedQuoteToken: string;
}

export default function OrderCard(props: OrderCardProps) {
    const { account, limitOrder, isDenomBase, selectedBaseToken, selectedQuoteToken } = props;
    // console.log({ limitOrder });

    // const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    // const tempPosHash = '0x01e650abfc761c6a0fc60f62a4e4b3832bb1178b';

    const isOwnerActiveAccount = limitOrder.user.toLowerCase() === account.toLowerCase();

    const ownerIdDisplay = limitOrder.ensResolution ? limitOrder.ensResolution : limitOrder.user;
    const [truncatedDisplayPrice, setTruncatedDisplayPrice] = useState<string | undefined>();

    const baseTokenCharacter = limitOrder.baseSymbol
        ? getUnicodeCharacter(limitOrder.baseSymbol)
        : '';
    const quoteTokenCharacter = limitOrder.quoteSymbol
        ? getUnicodeCharacter(limitOrder.quoteSymbol)
        : '';
    useEffect(() => {
        // console.log({ limitOrder });
        if (limitOrder.limitPriceDecimalCorrected && limitOrder.invLimitPriceDecimalCorrected) {
            const priceDecimalCorrected = limitOrder.limitPriceDecimalCorrected;
            const invPriceDecimalCorrected = limitOrder.invLimitPriceDecimalCorrected;

            const truncatedDisplayPrice = isDenomBase
                ? quoteTokenCharacter + invPriceDecimalCorrected?.toPrecision(6)
                : baseTokenCharacter + priceDecimalCorrected?.toPrecision(6);

            setTruncatedDisplayPrice(truncatedDisplayPrice);
        } else {
            setTruncatedDisplayPrice(undefined);
        }
    }, [JSON.stringify(limitOrder), isDenomBase]);

    const priceType =
        (isDenomBase && !limitOrder.isBid) || (!isDenomBase && limitOrder.isBid)
            ? 'priceBuy'
            : 'priceSell';

    const sideType =
        (isDenomBase && !limitOrder.isBid) || (!isDenomBase && limitOrder.isBid) ? 'buy' : 'sell';

    const baseTokenAddressLowerCase = limitOrder.base.toLowerCase();
    const quoteTokenAddressLowerCase = limitOrder.quote.toLowerCase();

    const transactionMatchesSelectedTokens =
        selectedBaseToken === baseTokenAddressLowerCase &&
        selectedQuoteToken === quoteTokenAddressLowerCase;

    if (!transactionMatchesSelectedTokens) return null;
    // if (!limitOrder.positionLiq) return null;

    const liqBaseNum = limitOrder.positionLiqBaseDecimalCorrected;
    const liqQuoteNum = limitOrder.positionLiqQuoteDecimalCorrected;

    const baseQtyTruncated = liqBaseNum
        ? liqBaseNum === 0
            ? '0'
            : liqBaseNum < 0.0001
            ? liqBaseNum.toExponential(2)
            : liqBaseNum < 2
            ? liqBaseNum.toPrecision(3)
            : liqBaseNum >= 100000
            ? formatAmount(liqBaseNum)
            : // ? baseLiqDisplayNum.toExponential(2)
              liqBaseNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '...';
    const quoteQtyTruncated = liqQuoteNum
        ? liqQuoteNum === 0
            ? '0'
            : liqQuoteNum < 0.0001
            ? liqQuoteNum.toExponential(2)
            : liqQuoteNum < 2
            ? liqQuoteNum.toPrecision(3)
            : liqQuoteNum >= 100000
            ? formatAmount(liqQuoteNum)
            : // ? baseLiqDisplayNum.toExponential(2)
              liqQuoteNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '...';

    const usdValueNum = limitOrder.positionLiqTotalUSD;
    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.0001
        ? usdValueNum.toExponential(2)
        : usdValueNum < 2
        ? usdValueNum.toPrecision(3)
        : usdValueNum >= 100000
        ? formatAmount(usdValueNum)
        : // ? baseLiqDisplayNum.toExponential(2)
          usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                {/* ------------------------------------------------------ */}

                <WalletAndId
                    ownerId={ownerIdDisplay}
                    posHash={limitOrder.limitOrderIdentifier.slice(42)}
                    isOwnerActiveAccount={isOwnerActiveAccount}
                />

                {/* ------------------------------------------------------ */}
                <Price priceType={priceType} displayPrice={truncatedDisplayPrice} />
                {/* ------------------------------------------------------ */}
                <OrderTypeSide type='order' side={sideType} />
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

            <div className={styles.menu_container}>
                <OrdersMenu userPosition={false} />
            </div>
        </div>
    );
}
