import { Dispatch, SetStateAction, useEffect, useState } from 'react';
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
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
}

export default function OrderCard(props: OrderCardProps) {
    const {
        account,
        limitOrder,
        currentPositionActive,
        setCurrentPositionActive,
        isDenomBase,
        selectedBaseToken,
        selectedQuoteToken,
    } = props;
    // console.log({ limitOrder });

    // const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    // const tempPosHash = '0x01e650abfc761c6a0fc60f62a4e4b3832bb1178b';
    const [isOrderFilled, setIsOrderFilled] = useState<boolean>(false);

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

            const nonInvertedPriceTruncated =
                priceDecimalCorrected === 0
                    ? '0.00'
                    : priceDecimalCorrected < 0.0001
                    ? priceDecimalCorrected.toExponential(2)
                    : priceDecimalCorrected < 2
                    ? priceDecimalCorrected.toPrecision(3)
                    : priceDecimalCorrected >= 100000
                    ? formatAmount(priceDecimalCorrected)
                    : priceDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });

            const invertedPriceTruncated =
                invPriceDecimalCorrected === 0
                    ? '0.00'
                    : invPriceDecimalCorrected < 0.0001
                    ? invPriceDecimalCorrected.toExponential(2)
                    : invPriceDecimalCorrected < 2
                    ? invPriceDecimalCorrected.toPrecision(3)
                    : invPriceDecimalCorrected >= 100000
                    ? formatAmount(invPriceDecimalCorrected)
                    : invPriceDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });

            const truncatedDisplayPrice = isDenomBase
                ? quoteTokenCharacter + invertedPriceTruncated
                : baseTokenCharacter + nonInvertedPriceTruncated;

            setTruncatedDisplayPrice(truncatedDisplayPrice);
        } else {
            setTruncatedDisplayPrice(undefined);
        }
    }, [JSON.stringify(limitOrder), isDenomBase]);

    useEffect(() => {
        if (
            limitOrder &&
            limitOrder.positionLiqBaseDecimalCorrected === 0 &&
            limitOrder.positionLiqQuoteDecimalCorrected === 0 &&
            !limitOrder.baseFlowDecimalCorrected &&
            !limitOrder.quoteFlowDecimalCorrected
            //  && limitOrder.source !== 'manual'
        ) {
            setIsOrderFilled(true);
            // return null;
        }
    }, [JSON.stringify(limitOrder)]);

    const priceType =
        (isDenomBase && !limitOrder.isBid) || (!isDenomBase && limitOrder.isBid)
            ? 'priceBuy'
            : 'priceSell';

    const sideType =
        (isDenomBase && !limitOrder.isBid) || (!isDenomBase && limitOrder.isBid) ? 'buy' : 'sell';

    const baseTokenAddressLowerCase = limitOrder.base.toLowerCase();
    const quoteTokenAddressLowerCase = limitOrder.quote.toLowerCase();

    const orderMatchesSelectedTokens =
        selectedBaseToken === baseTokenAddressLowerCase &&
        selectedQuoteToken === quoteTokenAddressLowerCase;

    const liqBaseNum =
        limitOrder.positionLiqBaseDecimalCorrected !== 0
            ? limitOrder.positionLiqBaseDecimalCorrected
            : limitOrder.baseFlowDecimalCorrected !== 0
            ? limitOrder.baseFlowDecimalCorrected
            : undefined;

    const liqQuoteNum =
        limitOrder.positionLiqQuoteDecimalCorrected !== 0
            ? limitOrder.positionLiqQuoteDecimalCorrected
            : limitOrder.quoteFlowDecimalCorrected !== 0
            ? limitOrder.quoteFlowDecimalCorrected
            : undefined;

    const baseQtyTruncated =
        limitOrder.source !== 'manual' && liqBaseNum !== undefined
            ? liqBaseNum === 0
                ? '0.00'
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
            : undefined;
    const quoteQtyTruncated =
        limitOrder.source !== 'manual' && liqQuoteNum !== undefined
            ? liqQuoteNum === 0
                ? '0.00'
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
            : undefined;

    const usdValueNum = limitOrder.totalValueUSD;
    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.0001
        ? usdValueNum.toExponential(2)
        : usdValueNum < 2
        ? usdValueNum.toPrecision(3)
        : usdValueNum >= 10000
        ? formatAmount(usdValueNum, 1)
        : // ? baseLiqDisplayNum.toExponential(2)
          usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const orderMenuProps = {
        closeGlobalModal: props.closeGlobalModal,
        openGlobalModal: props.openGlobalModal,
        isOwnerActiveAccount: isOwnerActiveAccount,
    };

    const orderDomId =
        limitOrder.limitOrderIdentifier === currentPositionActive
            ? `order-${limitOrder.limitOrderIdentifier}`
            : '';

    // console.log(rangeDetailsProps.lastBlockNumber);

    function scrollToDiv() {
        const element = document.getElementById(orderDomId);
        element?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }

    useEffect(() => {
        limitOrder.limitOrderIdentifier === currentPositionActive ? scrollToDiv() : null;
    }, [currentPositionActive]);

    const activePositionStyle =
        limitOrder.limitOrderIdentifier === currentPositionActive
            ? styles.active_position_style
            : '';
    if (!orderMatchesSelectedTokens) return null;

    // console.log(limitOrder);
    return (
        <li
            className={`${styles.main_container} ${activePositionStyle}`}
            onClick={() =>
                limitOrder.limitOrderIdentifier === currentPositionActive
                    ? null
                    : setCurrentPositionActive('')
            }
            id={orderDomId}
        >
            <div className={styles.main_container}>
                <div className={styles.row_container}>
                    {/* ------------------------------------------------------ */}

                    <WalletAndId
                        ownerId={ownerIdDisplay}
                        posHash={limitOrder.limitOrderIdentifier.slice(42)}
                        ensName={limitOrder.ensResolution ? limitOrder.ensResolution : null}
                        isOwnerActiveAccount={isOwnerActiveAccount}
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
                        <OpenOrderStatus isFilled={isOrderFilled} />
                    </div>
                </div>

                <div className={styles.menu_container}>
                    <OrdersMenu limitOrder={limitOrder} {...orderMenuProps} />
                </div>
            </div>
        </li>
    );
}
