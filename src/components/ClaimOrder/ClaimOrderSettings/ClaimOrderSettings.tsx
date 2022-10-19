import { Dispatch, SetStateAction } from 'react';
import styles from './ClaimOrderSettings.module.css';
import { BsArrowLeft } from 'react-icons/bs';
import Button from '../../Global/Button/Button';

interface ClaimOrderSettingsPropsIF {
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
    onBackClick: () => void;
}

export default function ClaimOrderSettings(props: ClaimOrderSettingsPropsIF) {
    // eslint-disable-next-line
    const { showSettings, setShowSettings, onBackClick } = props;

    const preset1 = '0.1';
    const preset2 = '0.3';
    const preset3 = '0.5';

    const slippageValue = 2;

    const setSlippage = (val: string) => console.log(val);

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
                    <div className={styles.slippage_title}>Slippage Tolerance (%)</div>
                    <div className={styles.slippage_box}>
                        <div className={styles.slippage_content}>
                            <div className={styles.input_container}>
                                <input
                                    id='Claim_order_slippage_tolerance_input_field'
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
            <Button title='CONFIRM' action={() => setShowSettings(false)} />
        </div>
    );
}
