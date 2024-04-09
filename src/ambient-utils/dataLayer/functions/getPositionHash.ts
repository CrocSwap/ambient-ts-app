import { PositionIF } from '../../types';
import { ambientPosSlot, concPosSlot } from './getSlot';
import { toHex } from 'viem';

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
            posHash = toHex(
                ambientPosSlot(
                    position.user,
                    position.base,
                    position.quote,
                    position.poolIdx,
                ),
            );
        } else {
            posHash = toHex(
                concPosSlot(
                    position.user,
                    position.base,
                    position.quote,
                    position.bidTick,
                    position.askTick,
                    position.poolIdx,
                ),
            );
        }
    } else if (details) {
        if (details.isPositionTypeAmbient) {
            posHash = toHex(
                ambientPosSlot(
                    details.user,
                    details.baseAddress,
                    details.quoteAddress,
                    details.poolIdx,
                ),
            );
        } else {
            posHash = toHex(
                concPosSlot(
                    details.user,
                    details.baseAddress,
                    details.quoteAddress,
                    details.bidTick,
                    details.askTick,
                    details.poolIdx,
                ),
            );
        }
    } else {
        posHash = '…';
    }

    return posHash;
}
