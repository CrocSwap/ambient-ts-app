import Price from '../../../Global/Tabs/Price/Price';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import TransactionTypeSide from '../../../Global/Tabs/TypeAndSide/TransactionTypeSide/TransactionTypeSide';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TransactionCard.module.css';
import { ISwap } from '../../../../utils/state/graphDataSlice';
import TransactionsMenu from '../../../Global/Tabs/TableMenu/TableMenuComponents/TransactionsMenu';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { toDisplayPrice, toDisplayQty } from '@crocswap-libs/sdk';
import truncateDecimals from '../../../../utils/data/truncateDecimals';

interface TransactionProps {
    swap: ISwap;
    tokenMap: Map<string, TokenIF>;
    chainId: string;
    tokenAAddress: string;
    tokenBAddress: string;
}
export default function TransactionCard(props: TransactionProps) {
    const { swap, tokenMap, chainId, tokenAAddress, tokenBAddress } = props;

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

    const truncatedDisplayPrice = truncateDecimals(displayPrice, 2);
    // console.log({ limitPrice });
    // console.log({ displayPrice });

    const baseQty = swap.inBaseQty
        ? toDisplayQty(swap.qty.toString(), baseToken?.decimals ?? 0)
        : undefined;
    const quoteQty = !swap.inBaseQty
        ? toDisplayQty(swap.qty.toString(), quoteToken?.decimals ?? 0)
        : undefined;

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

    return (
        <div className={styles.main_container}>
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
                    baseQty={baseQty}
                    quoteQty={quoteQty}
                />
            </div>

            <div className={styles.menu_container}>
                <TransactionsMenu userPosition={false} />
            </div>
        </div>
    );
}
