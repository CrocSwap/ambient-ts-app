import styles from './RangeCard.module.css';
import Price from '../../../Global/Tabs/Price/Price';
import TableMenu from '../../../Global/Tabs/TableMenu/TableMenu';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import OrderTypeSide from '../../../Global/Tabs/TypeAndSide/OrderTypeAndSide/OrderTypeSide';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import RangeMinMax from '../../../Global/Tabs/RangeMinMax/RangeMinMax';
import Apy from '../../../Global/Tabs/Apy/Apy';
import { Position } from '../../../../utils/state/graphDataSlice';
import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';

interface RangeCardProps {
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
    position: Position;
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
    const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const tempPosHash = '0x01e650abfc761c6a0fc60f62a4e4b3832bb1178b';

    const {
        position,
        // isAllPositionsEnabled,
        tokenAAddress,
        tokenBAddress,
        account,
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
                <TableMenu tableType='orders' userPosition={userPosition} />
            </div>
        </div>
    );
}
