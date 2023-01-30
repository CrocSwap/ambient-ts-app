import styles from './TransferCurrencySelector.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { Dispatch, SetStateAction } from 'react';
import { fromDisplayQty } from '@crocswap-libs/sdk';
import uriToHttp from '../../../../../utils/functions/uriToHttp';
import NoTokenIcon from '../../../../Global/NoTokenIcon/NoTokenIcon';

interface propsIF {
    fieldId: string;
    onClick: () => void;

    sellToken?: boolean;
    disable?: boolean;
    selectedToken: TokenIF;
    setTransferQty: Dispatch<SetStateAction<string | undefined>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>;
}

export default function TransferCurrencySelector(props: propsIF) {
    const { fieldId, disable, onClick, selectedToken, setTransferQty, inputValue, setInputValue } =
        props;

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                className={styles.currency_quantity}
                placeholder='0.00'
                onChange={(event) => {
                    const isValid = event.target.value === '' || event.target.validity.valid;
                    isValid ? setInputValue(event.target.value) : null;
                    if (parseFloat(event.target.value) > 0) {
                        const nonDisplayQty = fromDisplayQty(
                            event.target.value.replaceAll(',', ''),
                            selectedToken.decimals,
                        );
                        setTransferQty(nonDisplayQty.toString());
                    } else {
                        setTransferQty(undefined);
                    }
                }}
                value={inputValue}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9,]*[.]?[0-9]*$'
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
                    {selectedToken.logoURI ? (
                        <img
                            className={styles.token_list_img}
                            src={uriToHttp(selectedToken.logoURI)}
                            alt={selectedToken.symbol.charAt(0)}
                            // alt={`logo for token ${token.name}`}
                            width='30px'
                        />
                    ) : (
                        <NoTokenIcon tokenInitial={selectedToken.symbol.charAt(0)} width='30px' />
                    )}

                    <span className={styles.token_list_text}>{selectedToken.symbol}</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
        </div>
    );
}
