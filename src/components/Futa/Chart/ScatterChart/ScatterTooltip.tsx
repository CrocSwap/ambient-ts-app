import { useContext } from 'react';
import {
    getFormattedNumber,
    getTimeDifferenceAbbrev,
    getTimeRemainingAbbrev,
} from '../../../../ambient-utils/dataLayer';
import { AuctionsContext } from '../../../../contexts/AuctionsContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { scatterData, textColor } from './ScatterChart';

interface propsIF {
    hoveredDot: scatterData | undefined;
    selectedDot: scatterData | undefined;
}
export default function ScatterTooltip(props: propsIF) {
    const { isUserConnected } = useContext(UserDataContext);

    const { showComplete } = useContext(AuctionsContext);

    const { hoveredDot, selectedDot } = props;
    const displayData = hoveredDot
        ? hoveredDot
        : selectedDot
          ? selectedDot
          : undefined;

    const displayCompletedAuctionInfo = showComplete
        ? true
        : displayData
          ? displayData.timeRemaining <= 0
          : false;

    const formatTime = (time: number) => {
        return displayCompletedAuctionInfo
            ? getTimeDifferenceAbbrev(time)
            : getTimeRemainingAbbrev(time);
    };

    const formatPrice = (price: number) => {
        return getFormattedNumber({
            value: price,
            minFracDigits: 0,
            maxFracDigits: 0,
            isUSD: true,
        });
    };

    return (
        <div
            style={{
                gridColumn: 3,
                gridRow: 1,
                width: '150px',
                marginLeft: '0px',
                fontFamily: 'Roboto Mono',
                color: textColor,
                fontSize: '12px',
            }}
        >
            <p style={{ textAlign: 'left', margin: '2px 0' }}>
                TICKER:{' '}
                <span style={{ float: 'right', marginLeft: '5px' }}>
                    {displayData ? displayData.name : '-'}
                </span>
            </p>
            <p style={{ textAlign: 'left', margin: '2px 0' }}>
                {displayCompletedAuctionInfo ? 'COMPLETED:' : 'TIME REMAINING:'}
                <span style={{ float: 'right', marginLeft: '5px' }}>
                    {displayData ? formatTime(displayData.timeRemaining) : '-'}
                </span>
            </p>
            <p style={{ textAlign: 'left', margin: '2px 0' }}>
                MARKET CAP:{' '}
                <span style={{ float: 'right', marginLeft: '5px' }}>
                    {displayData ? formatPrice(displayData.price) : '-'}
                </span>
            </p>
            {isUserConnected && (
                <p style={{ textAlign: 'left', margin: '2px 0' }}>
                    YOUR BID:
                    <span style={{ float: 'right', marginLeft: '5px' }}>
                        {displayData ? displayData.userBidSize : '-'}
                    </span>
                </p>
            )}
        </div>
    );
}
