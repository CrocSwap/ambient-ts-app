import { Dispatch, SetStateAction } from 'react';
import styles from './HarvestPositionSettings.module.css';

interface HarvestPositionSettingsPropsIF {
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
}

export default function HarvestPositionSettings(props: HarvestPositionSettingsPropsIF) {
    // eslint-disable-next-line
    const { showSettings, setShowSettings } = props;

    // console.log(showSettings);
    const preset1 = '0.1';
    const preset2 = '0.3';
    const preset3 = '0.5';

    const slippageValue = 2;

    const setSlippage = (val: string) => console.log(val);

    return (
        <div className={styles.main_container}>
            <div className={styles.slippage_tolerance_container}>
                <div className={styles.slippage_title}>Slippage Tolerance (%)</div>
                <div className={styles.slippage_box}>
                    <div className={styles.slippage_content}>
                        <div className={styles.input_container}>
                            <input
                                id='harvest_position_slippage_tolerance_input_field'
                                onChange={(e) => setSlippage(e.target.value)}
                                type='text'
                                value={slippageValue}
                                placeholder={'slippage'}
                            />
                        </div>
                        <button onClick={() => setSlippage(preset1)}>{preset1}%</button>
                        <button onClick={() => setSlippage(preset2)}>{preset2}%</button>
                        <button onClick={() => setSlippage(preset3)}>{preset3}%</button>
                        {/* <button onClick={() => setSlippage('0.5')}>0.5%</button>
            <button onClick={() => setSlippage('1')}>1%</button> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
