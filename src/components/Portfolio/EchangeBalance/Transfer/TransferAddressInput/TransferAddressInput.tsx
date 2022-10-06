import { Dispatch, SetStateAction } from 'react';
import styles from './TransferAddressInput.module.css';

interface TransferAddressInputProps {
    fieldId: string;
    setTransferToAddress: Dispatch<SetStateAction<string | undefined>>;
    sellToken?: boolean;
    disable?: boolean;
    sendToAddress: string | undefined;
    // updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function TransferAddressInput(props: TransferAddressInputProps) {
    const { fieldId, disable, sendToAddress, setTransferToAddress } = props;

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-exchange-balance-transfer-quantity`}
                className={styles.currency_quantity}
                placeholder='Enter Hex or ENS address... '
                onChange={(event) => {
                    setTransferToAddress(event.target.value);
                }}
                defaultValue={sendToAddress ? sendToAddress : undefined}
                type='string'
                inputMode='text'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                // pattern='^[0-9]*[.,]?[0-9]*$'
                disabled={disable}
                required
            />
        </div>
    );

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>To</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>{rateInput}</div>
            </div>
        </div>
    );
}
