import Price from '../../../Global/Tabs/Price/Price';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import TransactionTypeSide from '../../../Global/Tabs/TypeAndSide/TransactionTypeSide/TransactionTypeSide';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TransactionCard.module.css';
import { ISwap } from '../../../../utils/state/graphDataSlice';
import TransactionsMenu from '../../../Global/Tabs/TableMenu/TableMenuComponents/TransactionsMenu';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { toDisplayPrice, toDisplayQty } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction } from 'react';

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
    const PosHash = swap.id;
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
            : 2;

    const truncatedDisplayPrice = isDenomBase
        ? (1 / displayPrice).toPrecision(6)
        : displayPrice.toPrecision(6);
    // console.log({ limitPrice });
    // console.log({ displayPrice });

    const swapQtyString = swap.qty.toString();
    const qtyIsExponential = swapQtyString.includes('e');

    const baseQty =
        swap.inBaseQty && !qtyIsExponential
            ? toDisplayQty(swapQtyString, baseToken?.decimals ?? 0)
            : undefined;

    const quoteQty =
        !swap.inBaseQty && !qtyIsExponential
            ? toDisplayQty(swapQtyString, quoteToken?.decimals ?? 0)
            : undefined;

    const truncatedBaseQty = baseQty
        ? parseFloat(baseQty)
              .toPrecision(6)
              .replace(/(?:\.0+|(\.\d+?)0+)$/, '$1')
        : '0';
    const truncatedQuoteQty = quoteQty
        ? parseFloat(quoteQty)
              .toPrecision(6)
              .replace(/(?:\.0+|(\.\d+?)0+)$/, '$1')
        : '0';

    // const qty = swap.qty;
    // const sellQty = swap.isBuy // sell token is base
    //     ? swap.inBaseQty
    //         ? swap.qty
    //         : swap.quote
    //     : swap.inBaseQty
    //     ? swap.quote
    //     : swap.base;

    // const qty = swap.isBuy // sell token is base
    //     ? swap.inBaseQty
    //         ? swap.qty

    const priceType = 'priceBuy';

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

                <WalletAndId ownerId={ownerId} posHash={PosHash} />

                {/* ------------------------------------------------------ */}

                <Price priceType={priceType} displayPrice={truncatedDisplayPrice} />
                {/* ------------------------------------------------------ */}

                <TransactionTypeSide type='remove' side='rangeAdd' />
                {/* ------------------------------------------------------ */}

                <TokenQty
                    baseToken={baseToken}
                    quoteToken={quoteToken}
                    baseQty={truncatedBaseQty}
                    quoteQty={truncatedQuoteQty}
                />
            </div>

            <div className={styles.menu_container}>
                <TransactionsMenu userPosition={false} />
            </div>
        </div>
    );
}
