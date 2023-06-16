import styles from './VolumeTVLFee.module.css';
import { Dispatch, SetStateAction, useState, useRef, memo } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import { LS_KEY_SUBCHART_SETTINGS } from '../../../../constants';

interface VolumeTVLFeePropsIF {
    setShowVolume: Dispatch<SetStateAction<boolean>>;
    setShowTvl: Dispatch<SetStateAction<boolean>>;
    setShowFeeRate: Dispatch<SetStateAction<boolean>>;
    showVolume: boolean;
    showTvl: boolean;
    showFeeRate: boolean;
}
function VolumeTVLFee(props: VolumeTVLFeePropsIF) {
    const {
        setShowVolume,
        setShowTvl,
        setShowFeeRate,
        showVolume,
        showTvl,
        showFeeRate,
    } = props;

    const updateSubChartToggles = (newStatus: {
        isVolumeSubchartEnabled: boolean;
        isTvlSubchartEnabled: boolean;
        isFeeRateSubchartEnabled: boolean;
    }) => {
        localStorage.setItem(
            LS_KEY_SUBCHART_SETTINGS,
            JSON.stringify({ ...newStatus }),
        );
    };

    const [showVolumeTVLFeeDropdown, setShowVolumeTVLFeeDropdown] =
        useState(false);

    const desktopView = useMediaQuery('(max-width: 968px)');

    const handleVolumeToggle = () => {
        setShowVolume(!showVolume);
        updateSubChartToggles({
            isVolumeSubchartEnabled: !showVolume,
            isTvlSubchartEnabled: showTvl,
            isFeeRateSubchartEnabled: showFeeRate,
        });
    };

    const handleTvlToggle = () => {
        setShowTvl(!showTvl);
        updateSubChartToggles({
            isVolumeSubchartEnabled: showVolume,
            isTvlSubchartEnabled: !showTvl,
            isFeeRateSubchartEnabled: showFeeRate,
        });
    };
    const handleFeeRateToggle = () => {
        setShowFeeRate(!showFeeRate);
        updateSubChartToggles({
            isVolumeSubchartEnabled: showVolume,
            isTvlSubchartEnabled: showTvl,
            isFeeRateSubchartEnabled: !showFeeRate,
        });
    };

    const volumeTvlAndFeeData = [
        { name: 'Volume', selected: showVolume, action: handleVolumeToggle },
        { name: 'TVL', selected: showTvl, action: handleTvlToggle },
        {
            name: 'Fee Rate',
            selected: showFeeRate,
            action: handleFeeRateToggle,
        },
    ];

    const wrapperStyle = showVolumeTVLFeeDropdown
        ? styles.dropdown_wrapper_active
        : styles.dropdown_wrapper;

    const dropdownItemRef = useRef<HTMLDivElement>(null);
    const clickOutsideHandler = () => {
        setShowVolumeTVLFeeDropdown(false);
    };
    useOnClickOutside(dropdownItemRef, clickOutsideHandler);

    function handleCurveDepthClickMobile(action: () => void) {
        action();
        setShowVolumeTVLFeeDropdown(false);
    }

    const volumeTVLFeeMobile = (
        <div className={styles.dropdown_menu} ref={dropdownItemRef}>
            <button
                className={styles.volume_tvl_fee_mobile_button}
                onClick={() =>
                    setShowVolumeTVLFeeDropdown(!showVolumeTVLFeeDropdown)
                }
                tabIndex={0}
                aria-label='Open volume and tvl dropdown.'
            >
                {showVolume
                    ? 'Volume'
                    : showTvl
                    ? 'TVL'
                    : showFeeRate
                    ? 'Fee Rate'
                    : ''}
            </button>

            <div className={wrapperStyle}>
                {volumeTvlAndFeeData.map((button, idx) => (
                    <div className={styles.volume_tvl_container} key={idx}>
                        <button
                            onClick={() =>
                                handleCurveDepthClickMobile(button.action)
                            }
                            className={
                                button.selected
                                    ? styles.active_selected_button
                                    : styles.non_active_selected_button
                            }
                            aria-label={`Show ${button.name}.`}
                        >
                            {button.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    if (desktopView) return volumeTVLFeeMobile;

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {volumeTvlAndFeeData.map((button, idx) => (
                <div className={styles.volume_tvl_container} key={idx}>
                    <button
                        onClick={button.action}
                        className={
                            button.selected
                                ? styles.active_selected_button
                                : styles.non_active_selected_button
                        }
                        aria-label={`${button.selected ? 'hide' : 'show'} ${
                            button.name
                        }.`}
                    >
                        {button.name}
                    </button>
                </div>
            ))}
        </div>
    );
}

export default memo(VolumeTVLFee);
