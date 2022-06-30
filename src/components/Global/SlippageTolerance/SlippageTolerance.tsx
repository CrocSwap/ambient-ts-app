import styles from './SlippageTolerance.module.css';

interface TransactionSettingsProps {
    slippageInput: number;
    setSlippageInput: React.Dispatch<React.SetStateAction<number>>;
}

export default function SlippageTolerance(props: TransactionSettingsProps) {
    const handleButtonClick = (value: string) => {
        const slippageInputField = document.getElementById(
            'slippage_tolerance_input_field',
        ) as HTMLInputElement;

        if (slippageInputField) {
            slippageInputField.value = value;
        }
        props.setSlippageInput(parseFloat(value));
    };
    return (
        <div className={styles.slippage_tolerance_container}>
            <div className={styles.slippage_title}>Slippage Tolerance (%)</div>
            <div className={styles.slippage_box}>
                <div className={styles.slippage_content}>
                    <div className={styles.input_container}>
                        <input
                            id='slippage_tolerance_input_field'
                            onChange={(e) => handleButtonClick(e.target.value)}
                            type='text '
                            placeholder={props.slippageInput.toString()}
                        />
                        {/* <div>%</div> */}
                    </div>
                    <button onClick={() => handleButtonClick('0.1')}>0.1%</button>
                    <button onClick={() => handleButtonClick('0.5')}>0.5%</button>
                    <button onClick={() => handleButtonClick('1')}>1%</button>
                </div>
            </div>
        </div>
    );
}
