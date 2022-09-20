import { toDisplayQty } from '@crocswap-libs/sdk';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { formatAmount } from '../../../../../utils/numbers';
import { ITransaction } from '../../../../../utils/state/graphDataSlice';
import Price from '../../../../Global/Tabs/Price/Price';
import TokenQty from '../../../../Global/Tabs/TokenQty/TokenQty';
import TransactionTypeSide from '../../../../Global/Tabs/TypeAndSide/TransactionTypeSide/TransactionTypeSide';
import AccountPoolDisplay from '../../../Tabs/AccountPoolDisplay/AccountPoolDisplay';
// import AccountTokensDisplay from '../../../Tabs/AccountTokensDisplay/AccountTokensDisplay';
import Value from '../../../Tabs/Value/Value';
// import WalletAndId from '../../../../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TransactionCard.module.css';
// import AccountPoolDisplay from '../../../Tabs/AccountPoolDisplay/AccountPoolDisplay';
// import AccountTokensDisplay from '../../../Tabs/AccountTokensDisplay/AccountTokensDisplay';
// import TransactionsMenu from '../../../Tabs/TableMenu/TableMenuComponents/TransactionsMenu';

interface TransactionProps {
    tx: ITransaction;
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

export default function TransactionCard(props: TransactionProps) {
    // const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    // const tempPosHash = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const { tx } = props;
    // console.log({ tx });

    const baseTokenSymbol = tx.baseSymbol;
    const quoteTokenSymbol = tx.quoteSymbol;

    const baseTokenCharacter = tx.baseSymbol ? getUnicodeCharacter(tx.baseSymbol) : '';
    const quoteTokenCharacter = tx.quoteSymbol ? getUnicodeCharacter(tx.quoteSymbol) : '';

    const invPriceDecimalCorrected = tx.invPriceDecimalCorrected;

    const invertedPriceTruncated = invPriceDecimalCorrected
        ? invPriceDecimalCorrected === 0
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
              })
        : '';
    const truncatedDisplayPrice = quoteTokenCharacter + invertedPriceTruncated;

    const priceType = tx.isBuy ? 'priceBuy' : 'priceSell';

    const sideType =
        tx.entityType === 'swap' || tx.entityType === 'limitOrder'
            ? tx.isBuy
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
    return (
        <div className={styles.main_container}>
            <div className={styles.tokens_container}>
                {/* <AccountTokensDisplay
                    baseTokenLogoURI={baseTokenLogoURI}
                    quoteTokenLogoURI={quoteTokenLogoURI}
                /> */}
            </div>
            <div className={styles.row_container}>
                <AccountPoolDisplay
                    baseTokenSymbol={baseTokenSymbol}
                    quoteTokenSymbol={quoteTokenSymbol}
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
