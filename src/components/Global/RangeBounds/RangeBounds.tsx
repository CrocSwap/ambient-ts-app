import { Dispatch, SetStateAction, useContext } from 'react';
import styles from './RangeBounds.module.css';
import RangeWidth from '../../Form/RangeWidth/RangeWidth';
import RangePriceInfo from '../../Trade/Range/RangePriceInfo/RangePriceInfo';
import MinMaxPrice from '../../Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import { motion } from 'framer-motion';
import AdvancedModeToggle from '../../Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import { RangeContext } from '../../../contexts/RangeContext';

import EditLiqPriceInfo from '../../Trade/EditLiquidity/EditLiqPriceInfo/EditLiqPriceInfo';

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
    // aprPercentage: number | undefined;
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
    maxRangePrice: number;
    minRangePrice: number;
    setMaxRangePrice: Dispatch<SetStateAction<number>>;
    setMinRangePrice: Dispatch<SetStateAction<number>>;
    isEditPanel?: boolean;
    isReposition?: boolean;
}

export default function RangeBounds(props: RangeBoundsProps) {
    const {
        rangeWidthPercentage,
        setRangeWidthPercentage,
        setRescaleRangeBoundariesWithSlider,
        inputId,
        //
        poolPriceCharacter,
        // aprPercentage,
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
        maxRangePrice,
        minRangePrice,
        setMaxRangePrice,
        setMinRangePrice,

        isRangeBoundsDisabled,
        customSwitch = false,
        isEditPanel,
        isReposition,
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
        // aprPercentage,
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
        maxRangePrice,
        minRangePrice,
        setMaxRangePrice,
        setMinRangePrice,
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
                {isEditPanel && (
                    <EditLiqPriceInfo
                        rangeWidthPercentage={rangeWidthPercentage}
                    />
                )}
            </motion.div>

            {isReposition || isEditPanel ? null : (
                <RangePriceInfo {...rangePriceInfoProps} />
            )}
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
                    {isEditPanel && <span className={styles.divider} />}
                    {isEditPanel && <EditLiqPriceInfo {...rangeWidthProps} />}
                </div>
            </motion.div>
        </>
    );

    // if (isEditPanel) return <RangeWidthControl />;
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
