import styles from './VolumeTVLFee.module.css';
import { Dispatch, SetStateAction } from 'react';

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

    const handleVolumeToggle = () => setShowVolume(!showVolume);

    const handleTvlToggle = () => setShowTvl(!showTvl);
    const handleFeeRateToggle = () => setShowFeeRate(!showFeeRate);

    const volumeTvlAndFeeData = [
        { name: 'Volume', selected: showVolume, action: handleVolumeToggle },
        { name: 'TVL', selected: showTvl, action: handleTvlToggle },
        { name: 'Fee Rate', selected: showFeeRate, action: handleFeeRateToggle },
    ];

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
