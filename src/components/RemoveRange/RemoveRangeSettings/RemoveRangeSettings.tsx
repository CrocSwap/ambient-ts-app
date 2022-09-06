import { Dispatch, SetStateAction } from 'react';
import styles from './RemoveRangeSettings.module.css';

interface RemoveRangeSettingsPropsIF {
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
}

export default function RemoveRangeSettings(props: RemoveRangeSettingsPropsIF) {
    // eslint-disable-next-line
    const { showSettings, setShowSettings } = props;

    // console.log(showSettings);

    // const settingButton = (
    //     showSettings && (
    //         <div className={styles.close_button} onClick={() => setShowSettings(false)}>
    //             <RiCloseLine size={25} />
    //         </div>
    //     )
    // )
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
                                id='remove_range_slippage_tolerance_input_field'
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
