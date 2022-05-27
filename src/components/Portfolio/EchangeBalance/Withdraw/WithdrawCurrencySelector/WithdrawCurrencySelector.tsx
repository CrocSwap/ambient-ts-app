import styles from './WithdrawCurrencySelector.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';
import Toggle from '../../../../Global/Toggle/Toggle';
import { useState } from 'react';

interface WithdrawCurrencySelectorProps {
    fieldId: string;

    sellToken?: boolean;
    disable?: boolean;

    // updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function WithdrawCurrencySelector(props: WithdrawCurrencySelectorProps) {
    const { fieldId, disable } = props;

    const [isChecked, setIsChecked] = useState<boolean>(false);

    const toggleContent = (
        <span className={styles.surplus_toggle}>
            Send to a different address
            <div className={styles.toggle_container}>
                <Toggle
                    isOn={isChecked}
                    handleToggle={() => setIsChecked(!isChecked)}
                    Width={36}
                    id='withdraw_to_different_address'
                />
            </div>
        </span>
    );

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-exchange-balance-withdraw-quantity`}
                className={styles.currency_quantity}
                placeholder='0'
                // onChange={(event) => updateOtherQuantity(event)}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*[.,]?[0-9]*$'
                disabled={disable}
                required
            />
        </div>
    );

    return (
        <div className={styles.swapbox}>
            {toggleContent}
            <span className={styles.direction}>Select Token</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>{rateInput}</div>
                <div className={styles.token_select}>
                    <img
                        className={styles.token_list_img}
                        src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt='ethreum'
                        width='30px'
                    />
                    <span className={styles.token_list_text}>ETH</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
        </div>
    );
}
