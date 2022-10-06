import styles from './WithdrawCurrencySelector.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';
import { Dispatch, SetStateAction } from 'react';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';

interface WithdrawCurrencySelectorProps {
    fieldId: string;
    onClick: () => void;
    isSendToAddressChecked: boolean;
    setIsSendToAddressChecked: Dispatch<SetStateAction<boolean>>;
    sellToken?: boolean;
    disable?: boolean;
    selectedToken: TokenIF;
    setWithdrawQty: Dispatch<SetStateAction<number>>; // updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function WithdrawCurrencySelector(props: WithdrawCurrencySelectorProps) {
    const { fieldId, disable, onClick, selectedToken, setWithdrawQty } = props;

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-exchange-balance-withdraw-quantity`}
                className={styles.currency_quantity}
                placeholder='0'
                onChange={(event) => {
                    setWithdrawQty(
                        parseFloat(event.target.value) > 0 ? parseFloat(event.target.value) : 0,
                    );
                }}
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
            <span className={styles.direction}>Select Token</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>{rateInput}</div>
                <div className={styles.token_select} onClick={onClick}>
                    <img
                        className={styles.token_list_img}
                        src={selectedToken.logoURI}
                        alt={selectedToken.name}
                        width='30px'
                    />
                    <span className={styles.token_list_text}>{selectedToken.symbol}</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
        </div>
    );
}
