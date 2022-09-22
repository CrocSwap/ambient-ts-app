import Price from '../../../Global/Tabs/Price/Price';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import TransactionTypeSide from '../../../Global/Tabs/TypeAndSide/TransactionTypeSide/TransactionTypeSide';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TransactionCard.module.css';
import { ITransaction } from '../../../../utils/state/graphDataSlice';
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
    tx: ITransaction;
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
        tx,
        account,
        // tokenMap,
        // chainId,
        blockExplorer,
        tokenAAddress,
        tokenBAddress,
        isDenomBase,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
    } = props;

    // const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const txHash = tx.tx;
    const ownerId = tx.user;

    const isOwnerActiveAccount = ownerId.toLowerCase() === account.toLowerCase();

    // const baseId = tx.base + '_' + chainId;
    // const quoteId = tx.quote + '_' + chainId;

    // const baseToken = tokenMap ? tokenMap.get(baseId.toLowerCase()) : undefined;
    // const quoteToken = tokenMap ? tokenMap.get(quoteId.toLowerCase()) : undefined;

    const transactionBaseAddressLowerCase = tx.base.toLowerCase();
    const transactionQuoteAddressLowerCase = tx.quote.toLowerCase();

    const tokenAAddressLowerCase = tokenAAddress.toLowerCase();
    const tokenBAddressLowerCase = tokenBAddress.toLowerCase();

    const transactionMatchesSelectedTokens =
        (transactionBaseAddressLowerCase === tokenAAddressLowerCase ||
            transactionQuoteAddressLowerCase === tokenAAddressLowerCase) &&
        (transactionBaseAddressLowerCase === tokenBAddressLowerCase ||
            transactionQuoteAddressLowerCase === tokenBAddressLowerCase);

    //    const qtyDecimals = tx.inBaseQty ? baseToken?.decimals : quoteToken?.decimals

    const [truncatedDisplayPrice, setTruncatedDisplayPrice] = useState<string | undefined>();
    // const limitPrice = tx.limitPrice;

    // console.log({ limitPrice });
    // console.log({ displayPrice });
    // console.log({ tx });
    // const txQtyString = tx.qty.toString();

    const [baseFlowDisplay, setBaseFlowDisplay] = useState<string | undefined>(undefined);
    const [quoteFlowDisplay, setQuoteFlowDisplay] = useState<string | undefined>(undefined);
    const txDomId = tx.id === currentTxActiveInTransactions ? `tx-${tx.id}` : '';

    function scrollToDiv() {
        const element = document.getElementById(txDomId);

        element?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }

    useEffect(() => {
        tx.id === currentTxActiveInTransactions ? scrollToDiv() : null;
    }, [currentTxActiveInTransactions]);

    const baseTokenCharacter = tx.baseSymbol ? getUnicodeCharacter(tx.baseSymbol) : '';
    const quoteTokenCharacter = tx.quoteSymbol ? getUnicodeCharacter(tx.quoteSymbol) : '';

    useEffect(() => {
        // console.log({ tx });
        if (tx.priceDecimalCorrected && tx.invPriceDecimalCorrected) {
            const priceDecimalCorrected = tx.priceDecimalCorrected;
            const invPriceDecimalCorrected = tx.invPriceDecimalCorrected;

            const nonInvertedPriceTruncated =
                priceDecimalCorrected === 0
                    ? '0'
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
                    ? '0'
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

            // const truncatedDisplayPrice = isDenomBase
            //     ? quoteTokenCharacter + invPriceDecimalCorrected?.toPrecision(3)
            //     : baseTokenCharacter + priceDecimalCorrected?.toPrecision(3);

            setTruncatedDisplayPrice(truncatedDisplayPrice);
        } else {
            setTruncatedDisplayPrice(undefined);
        }
        if (tx.baseFlow && tx.baseDecimals) {
            const baseFlowDisplayNum = parseFloat(toDisplayQty(tx.baseFlow, tx.baseDecimals));
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
            // console.log({ tx });
            // console.log(tx.tx);
            if (tx.inBaseQty) {
                if (!tx.isBuy) {
                    setBaseFlowDisplay(toDisplayQty(tx.qty, tx.baseDecimals));
                    setQuoteFlowDisplay(undefined);
                } else {
                    setBaseFlowDisplay('(' + toDisplayQty(tx.qty, tx.baseDecimals) + ')');
                    setQuoteFlowDisplay(undefined);
                }
            } else {
                if (!tx.isBuy) {
                    setQuoteFlowDisplay('(' + toDisplayQty(tx.qty, tx.quoteDecimals) + ')');
                    setBaseFlowDisplay(undefined);
                } else {
                    setQuoteFlowDisplay(toDisplayQty(tx.qty, tx.quoteDecimals));
                    setBaseFlowDisplay(undefined);
                }
            }
        }
        if (tx.quoteFlow && tx.quoteDecimals) {
            const quoteFlowDisplayNum = parseFloat(toDisplayQty(tx.quoteFlow, tx.quoteDecimals));
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
    }, [JSON.stringify(tx), isDenomBase]);

    const priceType =
        (isDenomBase && !tx.isBuy) || (!isDenomBase && tx.isBuy) ? 'priceBuy' : 'priceSell';

    const sideType =
        tx.entityType === 'swap' || tx.entityType === 'limitOrder'
            ? (isDenomBase && !tx.isBuy) || (!isDenomBase && tx.isBuy)
                ? 'buy'
                : 'sell'
            : tx.changeType === 'burn'
            ? 'sell'
            : 'buy';

    const transactionTypeSide =
        tx.entityType === 'swap'
            ? 'market'
            : tx.entityType === 'limitOrder'
            ? 'limit'
            : tx.changeType === 'burn'
            ? 'rangeRemove'
            : 'rangeAdd';

    if (!transactionMatchesSelectedTokens) return null;

    const activeTransactionStyle =
        tx.id === currentTxActiveInTransactions ? styles.active_tx_style : '';

    const usdValueNum = tx.valueUSD;

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
                tx.id === currentTxActiveInTransactions
                    ? null
                    : setCurrentTxActiveInTransactions('')
            }
            id={txDomId}
        >
            <div className={styles.row_container}>
                {/* ------------------------------------------------------ */}

                <WalletAndId
                    ownerId={ownerId}
                    posHash={txHash}
                    ensName={tx.ensResolution ? tx.ensResolution : null}
                    isOwnerActiveAccount={isOwnerActiveAccount}
                />

                {/* ------------------------------------------------------ */}

                <Price priceType={priceType} displayPrice={truncatedDisplayPrice} />
                {/* ------------------------------------------------------ */}

                <TransactionTypeSide type={sideType} side={transactionTypeSide} />
                {/* ------------------------------------------------------ */}

                <Value usdValue={usdValueTruncated ? '$' + usdValueTruncated : '…'} />
                <TokenQty
                    baseTokenCharacter={baseTokenCharacter}
                    quoteTokenCharacter={quoteTokenCharacter}
                    baseQty={baseFlowDisplay}
                    quoteQty={quoteFlowDisplay}
                />
                {/* <button onClick={() => props.openGlobalModal('New modal works')}>Here</button> */}
            </div>

            <div className={styles.menu_container}>
                <TransactionsMenu userPosition={false} tx={tx} blockExplorer={blockExplorer} />
            </div>
        </div>
    );
}
