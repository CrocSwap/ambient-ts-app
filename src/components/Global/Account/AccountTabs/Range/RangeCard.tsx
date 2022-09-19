// // import RangeStatus from '../../RangeStatus/RangeStatus';
import styles from './RangeCard.module.css';

import RangeStatus from '../../../RangeStatus/RangeStatus';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';
// import WalletAndId from '../../../Tabs/WalletAndID/WalletAndId';
import RangeMinMax from '../../../Tabs/RangeMinMax/RangeMinMax';
import TokenQty from '../../../Tabs/TokenQty/TokenQty';
import Apy from '../../../Tabs/Apy/Apy';
// import RangesMenu from '../../../Tabs/TableMenu/TableMenuComponents/RangesMenu';
import AccountPoolDisplay from '../../../Tabs/AccountPoolDisplay/AccountPoolDisplay';
import AccountTokensDisplay from '../../../Tabs/AccountTokensDisplay/AccountTokensDisplay';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';

interface RangeCardPropsIF {
    position: PositionIF;
}

export default function RangeCard(props: RangeCardPropsIF) {
    const { position } = props;

    const baseTokenLogoURI = position.baseTokenLogoURI;
    const quoteTokenLogoURI = position.quoteTokenLogoURI;

    const baseTokenSymbol = position.baseSymbol;
    const quoteTokenSymbol = position.quoteSymbol;

    const baseTokenCharacter = position.baseSymbol ? getUnicodeCharacter(position.baseSymbol) : '';
    const quoteTokenCharacter = position.quoteSymbol
        ? getUnicodeCharacter(position.quoteSymbol)
        : '';

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
                <RangeMinMax
                    min={quoteTokenCharacter + position.lowRangeShortDisplayInBase}
                    max={quoteTokenCharacter + position.highRangeShortDisplayInBase}
                />
                <TokenQty
                    baseTokenCharacter={baseTokenCharacter}
                    quoteTokenCharacter={quoteTokenCharacter}
                    baseQty={position.positionLiqBaseTruncated}
                    quoteQty={position.positionLiqQuoteTruncated}
                />
                <Apy amount={position.apy} />
                <RangeStatus
                    isInRange={position.isPositionInRange}
                    isAmbient={position.positionType === 'ambient'}
                />
            </div>

            <div className={styles.menu_container}>...</div>
        </div>
    );
}
