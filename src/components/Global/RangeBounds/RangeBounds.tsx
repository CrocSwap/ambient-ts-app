import { Dispatch, SetStateAction, useContext } from 'react';
import styles from './RangeBounds.module.css';
import RangeWidth from '../../Form/RangeWidth/RangeWidth';
import RangePriceInfo from '../../Trade/Range/RangePriceInfo/RangePriceInfo';
import MinMaxPrice from '../../Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import { motion } from 'framer-motion';
import AdvancedModeToggle from '../../Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import { RangeContext } from '../../../contexts/RangeContext';

interface RangeBoundsProps {
    customSwitch?: boolean;
    isRangeBoundsDisabled: boolean;
    // Props for Range Width
    rangeWidthPercentage: number;
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>;
    setRescaleRangeBoundariesWithSlider: Dispatch<SetStateAction<boolean>>;
    inputId: string;

    // Props for Range Price Info
    spotPriceDisplay: string;
    aprPercentage: number | undefined;
    poolPriceCharacter: string;
    isTokenABase: boolean;
    pinnedDisplayPrices:
        | {
              pinnedMinPriceDisplay: string;
              pinnedMaxPriceDisplay: string;
              pinnedMinPriceDisplayTruncated: string;
              pinnedMaxPriceDisplayTruncated: string;
              pinnedMinPriceDisplayTruncatedWithCommas: string;
              pinnedMaxPriceDisplayTruncatedWithCommas: string;
              pinnedLowTick: number;
              pinnedHighTick: number;
              pinnedMinPriceNonDisplay: number;
              pinnedMaxPriceNonDisplay: number;
          }
        | undefined;
    isAmbient: boolean;

    // Props for Min Max Price
    minPricePercentage: number;
    maxPricePercentage: number;
    minPriceInputString: string;
    maxPriceInputString: string;
    setMinPriceInputString: Dispatch<SetStateAction<string>>;
    setMaxPriceInputString: Dispatch<SetStateAction<string>>;
    disable?: boolean;
    isDenomBase: boolean;
    lowBoundOnBlur: () => void;
    highBoundOnBlur: () => void;
    rangeLowTick: number;
    rangeHighTick: number;
    maxPrice: number;
    minPrice: number;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
}

export default function RangeBounds(props: RangeBoundsProps) {
    const {
        rangeWidthPercentage,
        setRangeWidthPercentage,
        setRescaleRangeBoundariesWithSlider,
        inputId,
        //
        poolPriceCharacter,
        aprPercentage,
        pinnedDisplayPrices,
        isTokenABase,
        isAmbient,
        spotPriceDisplay,
        //
        minPricePercentage,
        maxPricePercentage,
        setMinPriceInputString,
        setMaxPriceInputString,
        minPriceInputString,
        maxPriceInputString,
        disable,
        isDenomBase,
        lowBoundOnBlur,
        highBoundOnBlur,
        rangeLowTick,
        rangeHighTick,
        maxPrice,
        minPrice,
        setMaxPrice,
        setMinPrice,

        isRangeBoundsDisabled,
        customSwitch = false,
    } = props;
    const rangeWidthProps = {
        rangeWidthPercentage,
        setRangeWidthPercentage,
        setRescaleRangeBoundariesWithSlider,
        inputId,
    };

    const rangePriceInfoProps = {
        pinnedDisplayPrices: pinnedDisplayPrices,
        spotPriceDisplay,
        // maxPriceDisplay: maxPriceDisplay,
        // minPriceDisplay: minPriceDisplay,
        aprPercentage,
        // daysInRange: daysInRange,
        isTokenABase,
        poolPriceCharacter,
        isAmbient,
    };

    const minMaxPricePropsIF = {
        minPricePercentage,
        maxPricePercentage,
        setMinPriceInputString,
        setMaxPriceInputString,
        disable,
        isDenomBase,
        lowBoundOnBlur,
        highBoundOnBlur,
        rangeLowTick,
        rangeHighTick,
        maxPrice,
        minPrice,
        setMaxPrice,
        setMinPrice,
        minPriceInputString,
        maxPriceInputString,
    };

    const { advancedMode } = useContext(RangeContext);

    const baseModeContent = (
        <div className={styles.info_container}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <RangeWidth {...rangeWidthProps} />
            </motion.div>
            <RangePriceInfo {...rangePriceInfoProps} />
        </div>
    );
    const advancedModeContent = (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.advanced_info_container}>
                    <MinMaxPrice {...minMaxPricePropsIF} />
                </div>
            </motion.div>
        </>
    );
    return (
        <section className={isRangeBoundsDisabled && styles.advanced_disabled}>
            {!customSwitch && (
                <div className={styles.denomination_switch_container}>
                    <AdvancedModeToggle />
                </div>
            )}
            {advancedMode ? advancedModeContent : baseModeContent}
        </section>
    );
}
