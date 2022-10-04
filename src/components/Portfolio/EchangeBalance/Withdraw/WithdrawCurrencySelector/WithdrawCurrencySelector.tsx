import styles from './WithdrawCurrencySelector.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';
import Toggle from '../../../../Global/Toggle/Toggle';
import { Dispatch, SetStateAction } from 'react';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';

interface WithdrawCurrencySelectorProps {
    fieldId: string;
    onClick: () => void;
    isSendToAddressChecked: boolean;
    setIsSendToAddressChecked: Dispatch<SetStateAction<boolean>>;
    sellToken?: boolean;
    disable?: boolean;
    tempTokenSelection: TokenIF;
    setWithdrawQty: Dispatch<SetStateAction<number | undefined>>; // updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function WithdrawCurrencySelector(props: WithdrawCurrencySelectorProps) {
    const {
        fieldId,
        disable,
        isSendToAddressChecked,
        setIsSendToAddressChecked,
        onClick,
        tempTokenSelection,
        setWithdrawQty,
    } = props;

    const toggleContent = (
        <span className={styles.surplus_toggle}>
            Send to a different address
            <div className={styles.toggle_container}>
                <Toggle
                    isOn={isSendToAddressChecked}
                    handleToggle={() => setIsSendToAddressChecked(!isSendToAddressChecked)}
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
                onChange={(event) => {
                    setWithdrawQty(parseFloat(event.target.value));
                }}
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
                <div className={styles.token_select} onClick={onClick}>
                    <img
                        className={styles.token_list_img}
                        src={tempTokenSelection.logoURI}
                        alt={tempTokenSelection.name}
                        width='30px'
                    />
                    <span className={styles.token_list_text}>{tempTokenSelection.symbol}</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
        </div>
    );
}
