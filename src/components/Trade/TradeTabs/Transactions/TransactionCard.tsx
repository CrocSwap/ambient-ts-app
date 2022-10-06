import Price from '../../../Global/Tabs/Price/Price';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import TransactionTypeSide from '../../../Global/Tabs/TypeAndSide/TransactionTypeSide/TransactionTypeSide';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TransactionCard.module.css';
import { ITransaction } from '../../../../utils/state/graphDataSlice';
import TransactionsMenu from '../../../Global/Tabs/TableMenu/TableMenuComponents/TransactionsMenu';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
// import {
//     //  toDisplayPrice,
//     toDisplayQty,
// } from '@crocswap-libs/sdk';
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
    const [truncatedLowDisplayPrice, setTruncatedLowDisplayPrice] = useState<string | undefined>();
    const [truncatedHighDisplayPrice, setTruncatedHighDisplayPrice] = useState<
        string | undefined
    >();
    // const limitPrice = tx.limitPrice;

    // console.log({ limitPrice });
    // console.log({ displayPrice });
    // console.log({ tx });
    // const txQtyString = tx.qty.toString();

    const [baseFlowDisplay, setBaseFlowDisplay] = useState<string | undefined>(undefined);
    const [quoteFlowDisplay, setQuoteFlowDisplay] = useState<string | undefined>(undefined);
    const [isAmbient, setIsAmbient] = useState<boolean>(false);

    useEffect(() => {
        setBaseFlowDisplay(undefined);
        setQuoteFlowDisplay(undefined);
    }, [tx.tx]);
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
        // setTruncatedDisplayPrice(undefined);
        if (tx.entityType === 'limitOrder') {
            if (tx.limitPriceDecimalCorrected && tx.invLimitPriceDecimalCorrected) {
                const priceDecimalCorrected = tx.limitPriceDecimalCorrected;
                const invPriceDecimalCorrected = tx.invLimitPriceDecimalCorrected;

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
                setTruncatedDisplayPrice(truncatedDisplayPrice);
            } else {
                setTruncatedDisplayPrice(undefined);
            }
        } else if (tx.entityType === 'liqchange') {
            if (
                tx.bidTickPriceDecimalCorrected &&
                tx.bidTickInvPriceDecimalCorrected &&
                tx.askTickPriceDecimalCorrected &&
                tx.askTickInvPriceDecimalCorrected
            ) {
                const bidTickPriceDecimalCorrected = tx.bidTickPriceDecimalCorrected;
                const bidTickInvPriceDecimalCorrected = tx.bidTickInvPriceDecimalCorrected;
                const askTickPriceDecimalCorrected = tx.askTickPriceDecimalCorrected;
                const askTickInvPriceDecimalCorrected = tx.askTickInvPriceDecimalCorrected;

                if (
                    tx.positionType === 'ambient'
                    // bidTickInvPriceDecimalCorrected === 1000000000000 ||
                    // bidTickPriceDecimalCorrected === 1e-12 ||
                    // bidTickPriceDecimalCorrected === 0
                ) {
                    setIsAmbient(true);
                } else {
                    setIsAmbient(false);
                }
                const nonInvertedBidPriceTruncated =
                    bidTickPriceDecimalCorrected === 1000000000000
                        ? '∞'
                        : bidTickPriceDecimalCorrected === 0 ||
                          bidTickPriceDecimalCorrected === 1e-12
                        ? '0.00'
                        : bidTickPriceDecimalCorrected < 0.001
                        ? bidTickPriceDecimalCorrected.toExponential(1)
                        : bidTickPriceDecimalCorrected < 2
                        ? // ? bidTickPriceDecimalCorrected.toPrecision(2)
                          bidTickPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })
                        : bidTickPriceDecimalCorrected >= 1000
                        ? formatAmount(bidTickPriceDecimalCorrected, 1)
                        : bidTickPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          });

                const invertedBidPriceTruncated =
                    bidTickInvPriceDecimalCorrected === 1000000000000
                        ? '∞'
                        : bidTickInvPriceDecimalCorrected === 0
                        ? '0.00'
                        : bidTickInvPriceDecimalCorrected < 0.001
                        ? bidTickInvPriceDecimalCorrected.toExponential(1)
                        : bidTickInvPriceDecimalCorrected < 2
                        ? bidTickInvPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })
                        : bidTickInvPriceDecimalCorrected >= 1000
                        ? formatAmount(bidTickInvPriceDecimalCorrected, 1)
                        : bidTickInvPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          });

                const nonInvertedAskPriceTruncated =
                    askTickPriceDecimalCorrected === 1000000000000
                        ? '∞'
                        : askTickPriceDecimalCorrected === 0
                        ? '0.00'
                        : askTickPriceDecimalCorrected < 0.001
                        ? askTickPriceDecimalCorrected.toExponential(1)
                        : askTickPriceDecimalCorrected < 2
                        ? askTickPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })
                        : askTickPriceDecimalCorrected >= 1000
                        ? formatAmount(askTickPriceDecimalCorrected, 1)
                        : askTickPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          });

                const invertedAskPriceTruncated =
                    askTickInvPriceDecimalCorrected === 1000000000000
                        ? '0.00'
                        : askTickInvPriceDecimalCorrected === 0
                        ? '∞'
                        : askTickInvPriceDecimalCorrected < 0.001
                        ? askTickInvPriceDecimalCorrected.toExponential(1)
                        : askTickInvPriceDecimalCorrected < 2
                        ? // ? askTickInvPriceDecimalCorrected.toPrecision(2)
                          askTickInvPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })
                        : askTickInvPriceDecimalCorrected >= 1000
                        ? formatAmount(askTickInvPriceDecimalCorrected, 1)
                        : askTickInvPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          });

                const truncatedLowDisplayPrice = isDenomBase
                    ? `${quoteTokenCharacter}${invertedAskPriceTruncated}`
                    : `${baseTokenCharacter}${nonInvertedAskPriceTruncated}`;

                const truncatedHighDisplayPrice = isDenomBase
                    ? `${quoteTokenCharacter}${invertedBidPriceTruncated}`
                    : `${baseTokenCharacter}${nonInvertedBidPriceTruncated}`;

                setTruncatedLowDisplayPrice(truncatedLowDisplayPrice);
                setTruncatedHighDisplayPrice(truncatedHighDisplayPrice);
            } else {
                setTruncatedLowDisplayPrice(undefined);
                setTruncatedHighDisplayPrice(undefined);
            }
        } else {
            if (tx.priceDecimalCorrected && tx.invPriceDecimalCorrected) {
                const priceDecimalCorrected = tx.priceDecimalCorrected;
                const invPriceDecimalCorrected = tx.invPriceDecimalCorrected;

                const nonInvertedPriceTruncated =
                    priceDecimalCorrected === 0
                        ? '0.00'
                        : priceDecimalCorrected < 0.001
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
                        : invPriceDecimalCorrected < 0.001
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
        }

        if (tx.baseFlowDecimalCorrected !== undefined && tx.baseFlowDecimalCorrected !== null) {
            const baseFlowDisplayNum = tx.baseFlowDecimalCorrected;
            const baseFlowAbsNum = Math.abs(baseFlowDisplayNum);
            const isBaseFlowPositive = baseFlowDisplayNum > 0;
            const baseFlowDisplayTruncated =
                baseFlowAbsNum === 0
                    ? '0.00'
                    : baseFlowAbsNum < 0.001
                    ? baseFlowAbsNum.toExponential(2)
                    : baseFlowAbsNum < 2
                    ? baseFlowAbsNum.toPrecision(3)
                    : baseFlowAbsNum >= 100000
                    ? formatAmount(baseFlowAbsNum)
                    : // ? baseLiqDisplayNum.toExponential(2)
                      baseFlowAbsNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            const baseFlowDisplayString = isBaseFlowPositive
                ? // (isBaseFlowNegative && tx.entityType !== 'liqchange') ||
                  // (!isBaseFlowNegative && tx.entityType === 'liqchange')
                  `(${baseFlowDisplayTruncated})`
                : baseFlowDisplayTruncated;
            setBaseFlowDisplay(baseFlowDisplayString);
        }
        if (tx.quoteFlowDecimalCorrected !== undefined && tx.quoteFlowDecimalCorrected !== null) {
            const quoteFlowDisplayNum = tx.quoteFlowDecimalCorrected;
            const quoteFlowAbsNum = Math.abs(quoteFlowDisplayNum);
            const isQuoteFlowPositive = quoteFlowDisplayNum > 0;
            const quoteFlowDisplayTruncated =
                quoteFlowAbsNum === 0
                    ? '0.00'
                    : quoteFlowAbsNum < 0.001
                    ? quoteFlowAbsNum.toExponential(2)
                    : quoteFlowAbsNum < 2
                    ? quoteFlowAbsNum.toPrecision(3)
                    : quoteFlowAbsNum >= 100000
                    ? formatAmount(quoteFlowAbsNum)
                    : // ? quoteLiqDisplayNum.toExponential(2)
                      quoteFlowAbsNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            const quoteFlowDisplayString = isQuoteFlowPositive
                ? // (isQuoteFlowNegative && tx.entityType !== 'liqchange') ||
                  // (!isQuoteFlowNegative && tx.entityType === 'liqchange')
                  `(${quoteFlowDisplayTruncated})`
                : quoteFlowDisplayTruncated;
            setQuoteFlowDisplay(quoteFlowDisplayString);
        }
    }, [JSON.stringify(tx), isDenomBase]);

    const priceType =
        tx.entityType === 'liqchange'
            ? 'range'
            : (isDenomBase && !tx.isBuy) || (!isDenomBase && tx.isBuy)
            ? 'priceBuy'
            : 'priceSell';

    const sideType =
        tx.entityType === 'liqchange'
            ? tx.changeType === 'burn'
                ? 'remove'
                : 'add'
            : tx.entityType === 'limitOrder'
            ? tx.changeType === 'mint'
                ? 'add'
                : 'remove'
            : (isDenomBase && tx.isBuy) || (!isDenomBase && !tx.isBuy)
            ? 'sell'
            : 'buy';
    // tx.entityType === 'liqchange'
    //     ? parseFloat(tx.quoteFlow) > 0
    //         ? 'add'
    //         : 'remove'
    //     : tx.entityType === 'limitOrder'
    //     ? tx.changeType === 'burn'
    //         ? 'remove'
    //         : 'add'
    //     : (isDenomBase && tx.isBuy) || (!isDenomBase && !tx.isBuy)
    //     ? 'sell'
    //     : 'buy';

    const transactionTypeSide =
        tx.entityType === 'liqchange'
            ? tx.changeType === 'mint'
                ? 'rangeAdd'
                : 'rangeRemove'
            : tx.entityType === 'limitOrder'
            ? 'limit'
            : 'market';

    const activeTransactionStyle =
        tx.id === currentTxActiveInTransactions ? styles.active_tx_style : '';

    const usdValueNum = tx.valueUSD;
    const totalValueUSD = tx.totalValueUSD;
    const totalFlowUSD = tx.totalFlowUSD;
    const totalFlowAbsNum = totalFlowUSD !== undefined ? Math.abs(totalFlowUSD) : undefined;

    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.001
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

    const totalValueUSDTruncated = !totalValueUSD
        ? undefined
        : totalValueUSD < 0.001
        ? totalValueUSD.toExponential(2)
        : totalValueUSD < 2
        ? totalValueUSD.toPrecision(3)
        : totalValueUSD >= 10000
        ? formatAmount(totalValueUSD, 1)
        : // ? baseLiqDisplayNum.toExponential(2)
          totalValueUSD.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const totalFlowUSDTruncated =
        totalFlowAbsNum === undefined
            ? undefined
            : totalFlowAbsNum === 0
            ? '0.00'
            : totalFlowAbsNum < 0.001
            ? totalFlowAbsNum.toExponential(2)
            : totalFlowAbsNum < 2
            ? totalFlowAbsNum.toPrecision(3)
            : totalFlowAbsNum >= 10000
            ? formatAmount(totalFlowAbsNum, 1)
            : // ? baseLiqDisplayNum.toExponential(2)
              totalFlowAbsNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    if (!transactionMatchesSelectedTokens) return null;
    if (tx.changeType === 'fill') return null;

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

                <Price
                    priceType={priceType}
                    isAmbient={isAmbient}
                    displayPrice={truncatedDisplayPrice}
                    truncatedLowDisplayPrice={truncatedLowDisplayPrice}
                    truncatedHighDisplayPrice={truncatedHighDisplayPrice}
                />
                {/* ------------------------------------------------------ */}

                <TransactionTypeSide
                    isDenomBase={isDenomBase}
                    type={sideType}
                    side={transactionTypeSide}
                    baseTokenCharacter={baseTokenCharacter}
                    quoteTokenCharacter={quoteTokenCharacter}
                />
                {/* ------------------------------------------------------ */}

                <Value
                    usdValue={
                        totalFlowUSDTruncated !== undefined
                            ? '$' + totalFlowUSDTruncated
                            : totalValueUSDTruncated
                            ? '$' + totalValueUSDTruncated
                            : usdValueTruncated
                            ? '$' + usdValueTruncated
                            : '…'
                    }
                />
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
