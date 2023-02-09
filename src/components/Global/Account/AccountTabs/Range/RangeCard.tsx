// // import RangeStatus from '../../RangeStatus/RangeStatus';
import styles from './RangeCard.module.css';

import RangeStatus from '../../../RangeStatus/RangeStatus';
import { PositionIF } from '../../../../../utils/interfaces/exports';
// import WalletAndId from '../../../Tabs/WalletAndID/WalletAndId';
import RangeMinMax from '../../../Tabs/RangeMinMax/RangeMinMax';
import TokenQty from '../../../Tabs/TokenQty/TokenQty';
import Apy from '../../../Tabs/Apy/Apy';
// import RangesMenu from '../../../Tabs/TableMenu/TableMenuComponents/RangesMenu';
import AccountPoolDisplay from '../../../Tabs/AccountPoolDisplay/AccountPoolDisplay';
import AccountTokensDisplay from '../../../Tabs/AccountTokensDisplay/AccountTokensDisplay';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import Value from '../../../Tabs/Value/Value';
import { formatAmountOld } from '../../../../../utils/numbers';

interface propsIF {
    position: PositionIF;
}

export default function RangeCard(props: propsIF) {
    const { position } = props;

    const baseTokenLogoURI = position.baseTokenLogoURI;
    const quoteTokenLogoURI = position.quoteTokenLogoURI;

    const baseTokenSymbol = position.baseSymbol;
    const quoteTokenSymbol = position.quoteSymbol;

    const baseTokenCharacter = position.baseSymbol ? getUnicodeCharacter(position.baseSymbol) : '';
    const quoteTokenCharacter = position.quoteSymbol
        ? getUnicodeCharacter(position.quoteSymbol)
        : '';

    const usdValueNum = position.totalValueUSD;

    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.0001
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

    const minRangeOrAmbient =
        position.positionType === 'ambient'
            ? '0'
            : quoteTokenCharacter + position.lowRangeShortDisplayInBase;
    const maxRangeOrAmbient =
        position.positionType === 'ambient'
            ? '∞'
            : quoteTokenCharacter + position.highRangeShortDisplayInBase;

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
                {/* <WalletAndId posHash='0xcD3eee3fddg134' ownerId={position.user} /> */}
                <RangeMinMax min={minRangeOrAmbient} max={maxRangeOrAmbient} />
                <Value usdValue={position.totalValueUSD ? '$' + usdValueTruncated : '…'} />
                <TokenQty
                    baseTokenCharacter={baseTokenCharacter}
                    quoteTokenCharacter={quoteTokenCharacter}
                    baseQty={position.positionLiqBaseTruncated}
                    quoteQty={position.positionLiqQuoteTruncated}
                />
                <Apy amount={position.apy} />
                <RangeStatus
                    isInRange={position.isPositionInRange}
                    isEmpty={position.totalValueUSD === 0}
                    isAmbient={position.positionType === 'ambient'}
                />
            </div>

            <div className={styles.menu_container}>...</div>
        </div>
    );
}
