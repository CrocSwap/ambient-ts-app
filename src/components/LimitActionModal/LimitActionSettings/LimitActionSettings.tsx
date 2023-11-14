import { Dispatch, SetStateAction } from 'react';
import styles from './LimitActionSettings.module.css';
import { BsArrowLeft } from 'react-icons/bs';
import { Button } from '@material-ui/core';
import { IS_LOCAL_ENV } from '../../../constants';

interface propsIF {
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
    onBackClick: () => void;
}

export default function LimitActionSettings(props: propsIF) {
    // eslint-disable-next-line
    const { showSettings, setShowSettings, onBackClick } = props;

    // values to generate preset buttons
    const presets: number[] = [0.1, 0.3, 0.5];
    // type derived as number-literal union for defined presets
    type presetValues = typeof presets[number];

    const slippageValue = 2;

    const setSlippage = (val: number | string): void => {
        IS_LOCAL_ENV && console.debug(val.toString());
    };

    return (
        <div className={styles.main_container}>
            <div>
                <header className={styles.header_container}>
                    <div onClick={() => setShowSettings(false)}>
                        <BsArrowLeft size={22} />
                    </div>
                    <h2>Order Removal Settings</h2>
                    <div />
                </header>
                <div className={styles.slippage_tolerance_container}>
                    <div className={styles.slippage_title}>
                        Slippage Tolerance (%)
                    </div>
                    <div className={styles.slippage_box}>
                        <div className={styles.slippage_content}>
                            <div className={styles.input_container}>
                                <input
                                    id='remove_order_slippage_tolerance_input_field'
                                    onChange={(e) =>
                                        setSlippage(e.target.value)
                                    }
                                    type='text'
                                    value={slippageValue}
                                    placeholder={'slippage'}
                                />
                            </div>
                            {presets.map((preset: presetValues) => {
                                // convert raw preset to human-readable string
                                const humanReadable: string = preset + '%';
                                // create a <button> elem for each defined preset
                                return (
                                    <button
                                        key={preset}
                                        id={`limit_actions_slippage_tolerance_${preset}`}
                                        onClick={() => setSlippage(preset)}
                                    >
                                        {humanReadable}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <Button title='CONFIRM' action={() => setShowSettings(false)} />
        </div>
    );
}
