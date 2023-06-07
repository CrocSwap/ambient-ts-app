import { Dispatch, SetStateAction } from 'react';
import styles from './TransferAddressInput.module.css';

interface TransferAddressInputProps {
    fieldId: string;
    setTransferToAddress: Dispatch<SetStateAction<string | undefined>>;
    disable?: boolean;
    sendToAddress: string | undefined;
}

export default function TransferAddressInput(props: TransferAddressInputProps) {
    const { fieldId, disable, sendToAddress, setTransferToAddress } = props;

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-exchange-balance-transfer-quantity`}
                className={styles.currency_quantity}
                placeholder='Enter Address or ENS ... '
                onChange={(event) => {
                    const value = event.target.value;
                    if (
                        value &&
                        !value.includes('.') &&
                        !value.startsWith('0x')
                    ) {
                        setTransferToAddress('0x' + event.target.value);
                    } else {
                        setTransferToAddress(value);
                    }
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
            />
        </div>
    );

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>To</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>{rateInput}</div>
            </div>
            <p className={styles.address_display}>
                {sendToAddress && sendToAddress.length > 30
                    ? sendToAddress
                    : undefined}
            </p>
        </div>
    );
}
