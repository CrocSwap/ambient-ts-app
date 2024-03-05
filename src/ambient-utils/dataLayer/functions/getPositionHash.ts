import { PositionIF } from '../../types';
import { ambientPosSlot, concPosSlot } from './getSlot';

// fn to get the position hash for a position
export function getPositionHash(
    position?: PositionIF,
    details?: {
        isPositionTypeAmbient: boolean;
        user: string;
        baseAddress: string;
        quoteAddress: string;
        poolIdx: number;
        bidTick: number;
        askTick: number;
    },
): string {
    let posHash;
    if (position !== undefined) {
        if (position.positionType == 'ambient') {
            posHash = ambientPosSlot(
                position.user,
                position.base,
                position.quote,
                position.poolIdx,
            ).toString();
        } else {
            posHash = concPosSlot(
                position.user,
                position.base,
                position.quote,
                position.bidTick,
                position.askTick,
                position.poolIdx,
            ).toString();
        }
    } else if (details) {
        if (details.isPositionTypeAmbient) {
            posHash = ambientPosSlot(
                details.user,
                details.baseAddress,
                details.quoteAddress,
                details.poolIdx,
            ).toString();
        } else {
            posHash = concPosSlot(
                details.user,
                details.baseAddress,
                details.quoteAddress,
                details.bidTick,
                details.askTick,
                details.poolIdx,
            ).toString();
        }
    } else {
        posHash = '…';
    }

    return posHash;
}
