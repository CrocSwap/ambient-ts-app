import { useCallback, useContext } from 'react';
import { TradeTableContext } from '../../contexts/TradeTableContext';

export const handlePulseAnimation = (type: 'swap' | 'limitOrder' | 'range') => {
    const {
        setShowSwapPulseAnimation,
        setShowOrderPulseAnimation,
        setShowRangePulseAnimation,
    } = useContext(TradeTableContext);
    switch (type) {
        case 'swap':
            setShowSwapPulseAnimation(true);
            setTimeout(() => {
                setShowSwapPulseAnimation(false);
            }, 3000);
            break;
        case 'limitOrder':
            setShowOrderPulseAnimation(true);
            setTimeout(() => {
                setShowOrderPulseAnimation(false);
            }, 3000);
            break;
        case 'range':
            setShowRangePulseAnimation(true);

            setTimeout(() => {
                setShowRangePulseAnimation(false);
            }, 3000);
            break;
        default:
            break;
    }
};
