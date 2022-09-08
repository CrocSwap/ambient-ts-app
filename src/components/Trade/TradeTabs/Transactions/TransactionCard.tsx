import Price from '../../../Global/Tabs/Price/Price';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import TransactionTypeSide from '../../../Global/Tabs/TypeAndSide/TransactionTypeSide/TransactionTypeSide';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TransactionCard.module.css';
import { ISwap } from '../../../../utils/state/graphDataSlice';
import TransactionsMenu from '../../../Global/Tabs/TableMenu/TableMenuComponents/TransactionsMenu';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import {
    //  toDisplayPrice,
    toDisplayQty,
} from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { formatAmount } from '../../../../utils/numbers';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import Value from '../../../Global/Tabs/Value/Value';

interface TransactionProps {
    swap: ISwap;
    account: string;
    tokenMap: Map<string, TokenIF>;
    chainId: string;
    blockExplorer?: string;
    tokenAAddress: string;
    tokenBAddress: string;
    isDenomBase: boolean;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;

    openGlobalModal: (content: React.ReactNode) => void;
}
export default function TransactionCard(props: TransactionProps) {
    const {
        swap,
        account,
        tokenMap,
        chainId,
        blockExplorer,
        tokenAAddress,
        tokenBAddress,
        isDenomBase,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
    } = props;

    // const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const txHash = swap.tx;
    const ownerId = swap.user;

    const isOwnerActiveAccount = ownerId.toLowerCase() === account.toLowerCase();

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

    const [truncatedDisplayPrice, setTruncatedDisplayPrice] = useState<string | undefined>();
    // const limitPrice = swap.limitPrice;

    // console.log({ limitPrice });
    // console.log({ displayPrice });
    // console.log({ swap });
    // const swapQtyString = swap.qty.toString();

    const [baseFlowDisplay, setBaseFlowDisplay] = useState<string | undefined>(undefined);
    const [quoteFlowDisplay, setQuoteFlowDisplay] = useState<string | undefined>(undefined);
    const swapDomId = swap.id === currentTxActiveInTransactions ? `swap-${swap.id}` : '';

    function scrollToDiv() {
        const element = document.getElementById(swapDomId);

        element?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }

    useEffect(() => {
        swap.id === currentTxActiveInTransactions ? scrollToDiv() : null;
    }, [currentTxActiveInTransactions]);

    useEffect(() => {
        // console.log({ swap });
        if (swap.priceDecimalCorrected && swap.invPriceDecimalCorrected) {
            const priceDecimalCorrected = swap.priceDecimalCorrected;
            const invPriceDecimalCorrected = swap.invPriceDecimalCorrected;

            const baseTokenCharacter = swap.baseSymbol ? getUnicodeCharacter(swap.baseSymbol) : '';
            const quoteTokenCharacter = swap.quoteSymbol
                ? getUnicodeCharacter(swap.quoteSymbol)
                : '';

            const truncatedDisplayPrice = isDenomBase
                ? quoteTokenCharacter + invPriceDecimalCorrected?.toPrecision(6)
                : baseTokenCharacter + priceDecimalCorrected?.toPrecision(6);

            setTruncatedDisplayPrice(truncatedDisplayPrice);
        } else {
            setTruncatedDisplayPrice(undefined);
        }
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
            // console.log({ swap });
            // console.log(swap.tx);
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
    }, [JSON.stringify(swap), isDenomBase]);

    const priceType =
        (isDenomBase && !swap.isBuy) || (!isDenomBase && swap.isBuy) ? 'priceBuy' : 'priceSell';
    const sideType = (isDenomBase && !swap.isBuy) || (!isDenomBase && swap.isBuy) ? 'buy' : 'sell';

    if (!transactionMatchesSelectedTokens) return null;

    const activeTransactionStyle =
        swap.id === currentTxActiveInTransactions ? styles.active_tx_style : '';

    const usdValueNum = swap.valueUSD;

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
        <div
            className={`${styles.main_container} ${activeTransactionStyle}`}
            onClick={() =>
                swap.id === currentTxActiveInTransactions
                    ? null
                    : setCurrentTxActiveInTransactions('')
            }
            id={swapDomId}
        >
            <div className={styles.row_container}>
                {/* ------------------------------------------------------ */}

                <WalletAndId
                    ownerId={ownerId}
                    posHash={txHash}
                    ensName={swap.ensResolution ? swap.ensResolution : null}
                    isOwnerActiveAccount={isOwnerActiveAccount}
                />

                {/* ------------------------------------------------------ */}

                <Price priceType={priceType} displayPrice={truncatedDisplayPrice} />
                {/* ------------------------------------------------------ */}

                <TransactionTypeSide type={sideType} side='market' />
                {/* ------------------------------------------------------ */}

                <Value usdValue={usdValueTruncated ? '$' + usdValueTruncated : '…'} />
                <TokenQty
                    baseTokenSymbol={baseToken?.symbol}
                    quoteTokenSymbol={quoteToken?.symbol}
                    baseQty={baseFlowDisplay}
                    quoteQty={quoteFlowDisplay}
                />
                <button onClick={() => props.openGlobalModal('New modal works')}>Here</button>
            </div>

            <div className={styles.menu_container}>
                <TransactionsMenu userPosition={false} tx={swap} blockExplorer={blockExplorer} />
            </div>
        </div>
    );
}
