import Price from '../../../Global/Tabs/Price/Price';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import TransactionTypeSide from '../../../Global/Tabs/TypeAndSide/TransactionTypeSide/TransactionTypeSide';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TransactionCard.module.css';
import { ISwap } from '../../../../utils/state/graphDataSlice';
import TransactionsMenu from '../../../Global/Tabs/TableMenu/TableMenuComponents/TransactionsMenu';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { toDisplayPrice, toDisplayQty } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { formatAmount } from '../../../../utils/numbers';

interface TransactionProps {
    swap: ISwap;
    tokenMap: Map<string, TokenIF>;
    chainId: string;
    tokenAAddress: string;
    tokenBAddress: string;
    isDenomBase: boolean;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
}
export default function TransactionCard(props: TransactionProps) {
    const {
        swap,
        tokenMap,
        chainId,
        tokenAAddress,
        tokenBAddress,
        isDenomBase,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
    } = props;

    // const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const txHash = swap.tx;
    const ownerId = swap.user;

    const baseId = swap.base + '_' + chainId;
    const quoteId = swap.quote + '_' + chainId;

    const baseToken = tokenMap ? tokenMap.get(baseId.toLowerCase()) : undefined;
    const quoteToken = tokenMap ? tokenMap.get(quoteId.toLowerCase()) : undefined;

    const transactionBaseAddressLowerCase = swap.base.toLowerCase();
    const transactionQuoteAddressLowerCase = swap.quote.toLowerCase();

    const tokenAAddressLowerCase = tokenAAddress.toLowerCase();
    const tokenBAddressLowerCase = tokenBAddress.toLowerCase();

    const transactionMatchesSelectedTokens =
        (transactionBaseAddressLowerCase === tokenAAddressLowerCase ||
            transactionQuoteAddressLowerCase === tokenAAddressLowerCase) &&
        (transactionBaseAddressLowerCase === tokenBAddressLowerCase ||
            transactionQuoteAddressLowerCase === tokenBAddressLowerCase);

    //    const qtyDecimals = swap.inBaseQty ? baseToken?.decimals : quoteToken?.decimals

    const limitPrice = swap.limitPrice;

    // if (transactionMatchesSelectedTokens) {
    //     console.log(baseToken?.decimals);
    //     console.log(quoteToken?.decimals);
    // }

    const displayPrice =
        limitPrice && baseToken?.decimals && quoteToken?.decimals
            ? toDisplayPrice(limitPrice, baseToken.decimals, quoteToken.decimals)
            : undefined;

    const truncatedDisplayPrice = displayPrice
        ? isDenomBase
            ? (1 / displayPrice).toPrecision(6)
            : displayPrice.toPrecision(6)
        : undefined;
    // console.log({ limitPrice });
    // console.log({ displayPrice });
    // console.log({ swap });
    // const swapQtyString = swap.qty.toString();

    const [baseFlowDisplay, setBaseFlowDisplay] = useState<string | undefined>(undefined);
    const [quoteFlowDisplay, setQuoteFlowDisplay] = useState<string | undefined>(undefined);

    useEffect(() => {
        // console.log({ swap });
        if (swap.baseFlow && swap.baseDecimals) {
            const baseFlowDisplayNum = parseFloat(toDisplayQty(swap.baseFlow, swap.baseDecimals));
            const baseFlowAbsNum = Math.abs(baseFlowDisplayNum);
            const isBaseFlowNegative = baseFlowDisplayNum > 0;
            const baseFlowDisplayTruncated =
                baseFlowAbsNum === 0
                    ? '0'
                    : baseFlowAbsNum < 0.0001
                    ? baseFlowDisplayNum.toExponential(2)
                    : baseFlowAbsNum < 2
                    ? baseFlowAbsNum.toPrecision(3)
                    : baseFlowAbsNum >= 100000
                    ? formatAmount(baseFlowAbsNum)
                    : // ? baseLiqDisplayNum.toExponential(2)
                      baseFlowAbsNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            const baseFlowDisplayString = isBaseFlowNegative
                ? `(${baseFlowDisplayTruncated})`
                : baseFlowDisplayTruncated;
            setBaseFlowDisplay(baseFlowDisplayString);
        } else {
            console.log(swap.tx);
            console.log({ swap });
            if (swap.inBaseQty) {
                if (!swap.isBuy) {
                    setBaseFlowDisplay(toDisplayQty(swap.qty, swap.baseDecimals));
                    setQuoteFlowDisplay(undefined);
                } else {
                    setBaseFlowDisplay('(' + toDisplayQty(swap.qty, swap.baseDecimals) + ')');
                    setQuoteFlowDisplay(undefined);
                }
            } else {
                if (!swap.isBuy) {
                    setQuoteFlowDisplay('(' + toDisplayQty(swap.qty, swap.quoteDecimals) + ')');
                    setBaseFlowDisplay(undefined);
                } else {
                    setQuoteFlowDisplay(toDisplayQty(swap.qty, swap.quoteDecimals));
                    setBaseFlowDisplay(undefined);
                }
            }
        }
        if (swap.quoteFlow && swap.quoteDecimals) {
            const quoteFlowDisplayNum = parseFloat(
                toDisplayQty(swap.quoteFlow, swap.quoteDecimals),
            );
            const quoteFlowAbsNum = Math.abs(quoteFlowDisplayNum);
            const isQuoteFlowNegative = quoteFlowDisplayNum > 0;
            const quoteFlowDisplayTruncated =
                quoteFlowAbsNum === 0
                    ? '0'
                    : quoteFlowAbsNum < 0.0001
                    ? quoteFlowDisplayNum.toExponential(2)
                    : quoteFlowAbsNum < 2
                    ? quoteFlowAbsNum.toPrecision(3)
                    : quoteFlowAbsNum >= 100000
                    ? formatAmount(quoteFlowAbsNum)
                    : // ? quoteLiqDisplayNum.toExponential(2)
                      quoteFlowAbsNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            const quoteFlowDisplayString = isQuoteFlowNegative
                ? `(${quoteFlowDisplayTruncated})`
                : quoteFlowDisplayTruncated;
            setQuoteFlowDisplay(quoteFlowDisplayString);
        }
    }, [JSON.stringify(swap)]);

    const priceType = swap.isBuy ? 'priceBuy' : 'priceSell';
    const sideType = swap.isBuy ? 'buy' : 'sell';

    if (!transactionMatchesSelectedTokens) return null;

    const activeTransactionStyle =
        swap.id === currentTxActiveInTransactions ? styles.active_tx_style : '';

    return (
        <div
            className={`${styles.main_container} ${activeTransactionStyle}`}
            onClick={() =>
                swap.id === currentTxActiveInTransactions
                    ? null
                    : setCurrentTxActiveInTransactions('')
            }
        >
            <div className={styles.row_container}>
                {/* ------------------------------------------------------ */}

                <WalletAndId ownerId={ownerId} posHash={txHash} />

                {/* ------------------------------------------------------ */}

                <Price priceType={priceType} displayPrice={truncatedDisplayPrice} />
                {/* ------------------------------------------------------ */}

                <TransactionTypeSide type={sideType} side='market' />
                {/* ------------------------------------------------------ */}

                <TokenQty
                    baseToken={baseToken}
                    quoteToken={quoteToken}
                    baseQty={baseFlowDisplay}
                    quoteQty={quoteFlowDisplay}
                />
            </div>

            <div className={styles.menu_container}>
                <TransactionsMenu userPosition={false} />
            </div>
        </div>
    );
}
