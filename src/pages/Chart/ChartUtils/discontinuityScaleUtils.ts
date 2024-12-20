import { CandleDataIF } from '../../../ambient-utils/types';
import { getLast15Minutes } from '../../platformAmbient/Chart/ChartUtils/chartUtils';
export interface DiscontinuityProvider {
    distance(start: number, end: number): number;
    offset(location: number | Date, offset: number): number | Date;
    clampUp(d: number | Date): number | Date;
    clampDown(d: number | Date): number | Date;
    copy(): DiscontinuityProvider;
}

export function filterCandleWithTransaction(
    data: CandleDataIF[],
    period: number,
) {
    const lat15Minutes = getLast15Minutes(period);

    const filteredByNonTransaction = data
        .sort((a, b) => a.time - b.time)
        .map((item, index, array) => {
            let isShowData = false;

            if (
                //                index === 0 ||
                index ===
                array.length - 1
            ) {
                isShowData = true;
            }

            const previousTvlData = index > 0 ? array[index - 1].tvlData : null;

            if (
                !previousTvlData ||
                item.volumeUSD !== 0 ||
                item.tvlData.tvl !== previousTvlData.tvl
            ) {
                isShowData = true;
            }

            if (lat15Minutes.some((time) => time === item.time * 1000)) {
                isShowData = true;
            }

            return {
                ...item,
                isShowData: isShowData,
            };
        });

    return filteredByNonTransaction.sort((a, b) => b.time - a.time);
}
