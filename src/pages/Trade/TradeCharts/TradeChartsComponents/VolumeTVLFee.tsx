import styles from './VolumeTVLFee.module.css';
import { Dispatch, SetStateAction, useState } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

interface VolumeTVLFeePropsIF {
    setShowVolume: Dispatch<SetStateAction<boolean>>;
    setShowTvl: Dispatch<SetStateAction<boolean>>;
    setShowFeeRate: Dispatch<SetStateAction<boolean>>;

    showVolume: boolean;
    showTvl: boolean;
    showFeeRate: boolean;
}
export default function VolumeTVLFee(props: VolumeTVLFeePropsIF) {
    const { setShowVolume, setShowTvl, setShowFeeRate, showVolume, showTvl, showFeeRate } = props;

    const [showVolumeTVLFeeDropdown, setShowVolumeTVLFeeDropdown] = useState(false);

    const desktopView = useMediaQuery('(max-width: 768px)');

    const handleVolumeToggle = () => setShowVolume(!showVolume);

    const handleTvlToggle = () => setShowTvl(!showTvl);
    const handleFeeRateToggle = () => setShowFeeRate(!showFeeRate);

    const volumeTvlAndFeeData = [
        { name: 'Volume', selected: showVolume, action: handleVolumeToggle },
        { name: 'TVL', selected: showTvl, action: handleTvlToggle },
        { name: 'Fee Rate', selected: showFeeRate, action: handleFeeRateToggle },
    ];

    const wrapperStyle = showVolumeTVLFeeDropdown
        ? styles.dropdown_wrapper_active
        : styles.dropdown_wrapper;

    const volumeTVLFeeMobile = (
        <div className={styles.dropdown_menu}>
            <button
                className={styles.volume_tvl_fee_mobile_button}
                onClick={() => setShowVolumeTVLFeeDropdown(!showVolumeTVLFeeDropdown)}
            >
                {showVolume ? 'Volume' : showTvl ? 'TVL' : showFeeRate ? 'Fee Rate' : ''}
            </button>

            <div className={wrapperStyle}>
                {volumeTvlAndFeeData.map((button, idx) => (
                    <div className={styles.volume_tvl_container} key={idx}>
                        <button
                            onClick={button.action}
                            className={
                                button.selected
                                    ? styles.active_selected_button
                                    : styles.non_active_selected_button
                            }
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
                    >
                        {button.name}
                    </button>
                </div>
            ))}
        </div>
    );
}
