import styles from './RangeCard.module.css';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import RangeMinMax from '../../../Global/Tabs/RangeMinMax/RangeMinMax';
import Apy from '../../../Global/Tabs/Apy/Apy';
import { PositionIF } from '../../../../utils/state/graphDataSlice';
import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';
import RangesMenu from '../../../Global/Tabs/TableMenu/TableMenuComponents/RangesMenu';

interface RangeCardProps {
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
    position: PositionIF;
    isAllPositionsEnabled: boolean;
    tokenAAddress: string;
    tokenBAddress: string;
    isAuthenticated: boolean;
    account?: string;
    isDenomBase: boolean;
    userPosition?: boolean;
    lastBlockNumber: number;
}

export default function RangeCard(props: RangeCardProps) {
    const {
        position,
        // isAllPositionsEnabled,
        tokenAAddress,
        tokenBAddress,
        // account,
        // notOnTradeRoute,
        // isAuthenticated,

        userPosition,
        lastBlockNumber,
    } = props;

    const positionData = {
        position: position,
    };

    // -------------------------------POSITION HASH------------------------

    let posHash;
    if (position.ambient) {
        posHash = ambientPosSlot(position.user, position.base, position.quote);
    } else {
        posHash = concPosSlot(
            position.user,
            position.base,
            position.quote,
            position.bidTick,
            position.askTick,
        );
    }

    // -------------------------------END OF POSITION HASH------------------------

    // -----------------------------POSITIONS RANGE--------------------
    let isPositionInRange = true;

    if (position.poolPriceInTicks) {
        if (position.ambient) {
            isPositionInRange = true;
        } else if (
            position.bidTick <= position.poolPriceInTicks &&
            position.poolPriceInTicks <= position.askTick
        ) {
            isPositionInRange = true;
        } else {
            isPositionInRange = false;
        }
    }

    // ----------------------------------END OF POSITIONS RANGE-------------------

    // --------------------SELECTED TOKEN FUNCTIONALITY---------------------------
    // const ownerId = position ? position.user : null;

    const positionBaseAddressLowerCase = position.base.toLowerCase();
    const positionQuoteAddressLowerCase = position.quote.toLowerCase();

    const tokenAAddressLowerCase = tokenAAddress.toLowerCase();
    const tokenBAddressLowerCase = tokenBAddress.toLowerCase();

    const positionMatchesSelectedTokens =
        (positionBaseAddressLowerCase === tokenAAddressLowerCase ||
            positionQuoteAddressLowerCase === tokenAAddressLowerCase) &&
        (positionBaseAddressLowerCase === tokenBAddressLowerCase ||
            positionQuoteAddressLowerCase === tokenBAddressLowerCase);

    // const accountAddress = account ? account.toLowerCase() : null;

    // const positionOwnedByConnectedAccount = ownerId === accountAddress;

    // -------------------- ENDSELECTED TOKEN FUNCTIONALITY---------------------------

    // ---------------------------------POSITIONS MIN AND MAX RANGE--------------------

    const minRange = props.isDenomBase
        ? position.lowRangeDisplayInBase
        : position.lowRangeDisplayInQuote;
    const maxRange = props.isDenomBase
        ? position.highRangeDisplayInBase
        : position.highRangeDisplayInQuote;

    const ambientMinOrNull = position.ambient ? 'ambient' : minRange;
    const ambientMaxOrNull = position.ambient ? 'ambient' : maxRange;

    // ---------------------------------END OF POSITIONS MIN AND MAX RANGE--------------------

    // --------------------------REMOVE RANGE PROPS-------------------------------
    const removeRangeProps = {
        isPositionInRange: isPositionInRange,
        isAmbient: position.ambient,
        baseTokenSymbol: position.baseTokenSymbol,
        baseTokenDecimals: position.baseTokenDecimals,
        quoteTokenSymbol: position.quoteTokenSymbol,
        quoteTokenDecimals: position.quoteTokenDecimals,
        lowRangeDisplayInBase: position.lowRangeDisplayInBase,
        highRangeDisplayInBase: position.highRangeDisplayInBase,
        lowRangeDisplayInQuote: position.lowRangeDisplayInQuote,
        highRangeDisplayInQuote: position.highRangeDisplayInQuote,
        baseTokenLogoURI: position.baseTokenLogoURI,
        quoteTokenLogoURI: position.quoteTokenLogoURI,
        isDenomBase: props.isDenomBase,
        baseTokenAddress: props.position.base,
        quoteTokenAddress: props.position.quote,
        lastBlockNumber: lastBlockNumber,
    };

    // ------------------------------END OF REMOVE RANGE PROPS-----------------
    if (!positionMatchesSelectedTokens) return null;
    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                {/* ------------------------------------------------------ */}

                <WalletAndId
                    ownerId={position.user}
                    posHash={posHash as string}
                    ensName={position.userEnsName ? position.userEnsName : null}
                />

                {/* ------------------------------------------------------ */}
                <RangeMinMax min={ambientMinOrNull} max={ambientMaxOrNull} />
                {/* ------------------------------------------------------ */}

                <TokenQty />
                {/* ------------------------------------------------------ */}
                <Apy amount={10} />
                {/* ------------------------------------------------------ */}
                <RangeStatus isInRange={isPositionInRange} isAmbient={position.ambient} />
            </div>

            <div className={styles.menu_container}>
                <RangesMenu
                    userPosition={userPosition}
                    removeRangeProps={removeRangeProps}
                    posHash={posHash as string}
                    positionData={positionData}
                />
            </div>
        </div>
    );
}
