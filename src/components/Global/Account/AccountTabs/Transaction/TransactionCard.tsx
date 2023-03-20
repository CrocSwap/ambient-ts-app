// import { toDisplayQty } from '@crocswap-libs/sdk';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { formatAmountOld } from '../../../../../utils/numbers';
import Price from '../../../../Global/Tabs/Price/Price';
import TokenQty from '../../../../Global/Tabs/TokenQty/TokenQty';
import TransactionTypeSide from '../../../../Global/Tabs/TypeAndSide/TransactionTypeSide/TransactionTypeSide';
import AccountPoolDisplay from '../../../Tabs/AccountPoolDisplay/AccountPoolDisplay';
// import AccountTokensDisplay from '../../../Tabs/AccountTokensDisplay/AccountTokensDisplay';
import Value from '../../../Tabs/Value/Value';
// import WalletAndId from '../../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TransactionCard.module.css';
// import AccountPoolDisplay from '../../../Tabs/AccountPoolDisplay/AccountPoolDisplay';
import AccountTokensDisplay from '../../../Tabs/AccountTokensDisplay/AccountTokensDisplay';
import { useEffect, useState } from 'react';
// import TransactionsMenu from '../../../Tabs/TableMenu/TableMenuComponents/TransactionsMenu';
import { TransactionIF } from '../../../../../utils/interfaces/exports';

interface propsIF {
    tx: TransactionIF;
    // account: string;
    // tokenMap: Map<string, TokenIF>;
    // chainId: string;
    // blockExplorer?: string;
    // tokenAAddress: string;
    // tokenBAddress: string;
    // isDenomBase: boolean;
    // currentTxActiveInTransactions: string;
    // setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;

    // openGlobalModal: (content: React.ReactNode) => void;
}

export default function TransactionCard(props: propsIF) {
    // const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    // const tempPosHash = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const { tx } = props;
    // console.log({ tx });

    if (tx.changeType === 'fill') return null;

    const baseTokenSymbol = tx.baseSymbol;
    const quoteTokenSymbol = tx.quoteSymbol;

    const baseTokenLogoURI = tx.baseTokenLogoURI;
    const quoteTokenLogoURI = tx.quoteTokenLogoURI;

    const baseTokenCharacter = tx.baseSymbol ? getUnicodeCharacter(tx.baseSymbol) : '';
    const quoteTokenCharacter = tx.quoteSymbol ? getUnicodeCharacter(tx.quoteSymbol) : '';
    const [isAmbient, setIsAmbient] = useState<boolean>(false);

    const [truncatedDisplayPrice, setTruncatedDisplayPrice] = useState<string | undefined>();
    const [truncatedLowDisplayPrice, setTruncatedLowDisplayPrice] = useState<string | undefined>();
    const [truncatedHighDisplayPrice, setTruncatedHighDisplayPrice] = useState<
        string | undefined
    >();

    useEffect(() => {
        if (tx.entityType === 'limitOrder') {
            if (tx.limitPriceDecimalCorrected && tx.invLimitPriceDecimalCorrected) {
                const invPriceDecimalCorrected = tx.invLimitPriceDecimalCorrected;

                const invertedPriceTruncated =
                    invPriceDecimalCorrected === 0
                        ? '0.00'
                        : invPriceDecimalCorrected < 0.001
                        ? invPriceDecimalCorrected.toExponential(2)
                        : invPriceDecimalCorrected < 2
                        ? invPriceDecimalCorrected.toPrecision(3)
                        : invPriceDecimalCorrected >= 100000
                        ? formatAmountOld(invPriceDecimalCorrected)
                        : invPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });
                setTruncatedDisplayPrice(quoteTokenCharacter + invertedPriceTruncated);
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
                const askTickInvPriceDecimalCorrected = tx.askTickInvPriceDecimalCorrected;

                if (
                    bidTickInvPriceDecimalCorrected === 1000000000000 ||
                    bidTickPriceDecimalCorrected === 1e-12 ||
                    bidTickPriceDecimalCorrected === 0
                ) {
                    setIsAmbient(true);
                } else {
                    setIsAmbient(false);
                }

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
                        ? formatAmountOld(bidTickInvPriceDecimalCorrected, 1)
                        : bidTickInvPriceDecimalCorrected.toLocaleString(undefined, {
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
                        ? formatAmountOld(askTickInvPriceDecimalCorrected, 1)
                        : askTickInvPriceDecimalCorrected.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          });

                const truncatedLowDisplayPrice = `${quoteTokenCharacter}${invertedAskPriceTruncated}`;

                const truncatedHighDisplayPrice = `${quoteTokenCharacter}${invertedBidPriceTruncated}`;

                setTruncatedLowDisplayPrice(truncatedLowDisplayPrice);
                setTruncatedHighDisplayPrice(truncatedHighDisplayPrice);
            } else {
                setTruncatedLowDisplayPrice(undefined);
                setTruncatedHighDisplayPrice(undefined);
            }
        } else {
            if (tx.priceDecimalCorrected && tx.invPriceDecimalCorrected) {
                const invPriceDecimalCorrected = tx.invPriceDecimalCorrected;

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

                setTruncatedDisplayPrice(truncatedDisplayPrice);
            } else {
                setTruncatedDisplayPrice(undefined);
            }
        }
    }, [JSON.stringify(tx)]);

    const priceType =
        tx.entityType === 'liqchange'
            ? 'range'
            : !tx.isBuy
            ? // : (isDenomBase && !tx.isBuy) || (!isDenomBase && tx.isBuy)
              'priceBuy'
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
            : tx.isBuy
            ? 'sell'
            : 'buy';

    const transactionTypeSide =
        tx.entityType === 'liqchange'
            ? tx.changeType === 'mint'
                ? 'rangeAdd'
                : 'rangeRemove'
            : tx.entityType === 'limitOrder'
            ? 'limit'
            : 'market';

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
        ? formatAmountOld(usdValueNum, 1)
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
        ? formatAmountOld(totalValueUSD, 1)
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
            ? formatAmountOld(totalFlowAbsNum, 1)
            : // ? baseLiqDisplayNum.toExponential(2)
              totalFlowAbsNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const baseFlowDisplayNum = tx.baseFlowDecimalCorrected ?? 0;
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
            ? formatAmountOld(baseFlowAbsNum)
            : // ? baseLiqDisplayNum.toExponential(2)
              baseFlowAbsNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });
    const baseFlowDisplayString =
        tx.baseFlowDecimalCorrected === null
            ? undefined
            : isBaseFlowPositive
            ? // (isBaseFlowNegative && tx.entityType !== 'liqchange') ||
              // (!isBaseFlowNegative && tx.entityType === 'liqchange')
              `(${baseFlowDisplayTruncated})`
            : baseFlowDisplayTruncated;

    const quoteFlowDisplayNum = tx.quoteFlowDecimalCorrected ?? 0;
    // const quoteFlowDisplayNum = parseFloat(toDisplayQty(tx.quoteFlow ?? '0', tx.quoteDecimals));
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
            ? formatAmountOld(quoteFlowAbsNum)
            : // ? quoteLiqDisplayNum.toExponential(2)
              quoteFlowAbsNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const quoteFlowDisplayString =
        tx.quoteFlowDecimalCorrected === null
            ? undefined
            : isQuoteFlowPositive
            ? // (isQuoteFlowNegative && tx.entityType !== 'liqchange') ||
              // (!isQuoteFlowNegative && tx.entityType === 'liqchange')
              `(${quoteFlowDisplayTruncated})`
            : quoteFlowDisplayTruncated;

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

                <Price
                    priceType={priceType}
                    isAmbient={isAmbient}
                    displayPrice={truncatedDisplayPrice}
                    truncatedLowDisplayPrice={truncatedLowDisplayPrice}
                    truncatedHighDisplayPrice={truncatedHighDisplayPrice}
                />
                {/* ------------------------------------------------------ */}

                <TransactionTypeSide
                    type={sideType}
                    side={transactionTypeSide}
                    isDenomBase={true}
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
                    baseQty={baseFlowDisplayString}
                    quoteQty={quoteFlowDisplayString}
                />
                {/* <button onClick={() => props.openGlobalModal('New modal works')}>Here</button> */}
            </div>

            <div className={styles.menu_container}>
                {/* <TransactionsMenu userPosition={false} tx={null}/> */}
            </div>
        </div>
    );
}
