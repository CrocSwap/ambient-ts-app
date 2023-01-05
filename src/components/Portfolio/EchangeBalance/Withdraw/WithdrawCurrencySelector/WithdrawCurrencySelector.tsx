import styles from './WithdrawCurrencySelector.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';
import { Dispatch, SetStateAction } from 'react';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';
import { fromDisplayQty } from '@crocswap-libs/sdk';
import NoTokenIcon from '../../../../Global/NoTokenIcon/NoTokenIcon';
import uriToHttp from '../../../../../utils/functions/uriToHttp';

interface WithdrawCurrencySelectorProps {
    fieldId: string;
    onClick: () => void;
    isSendToAddressChecked: boolean;
    setIsSendToAddressChecked: Dispatch<SetStateAction<boolean>>;
    sellToken?: boolean;
    disable?: boolean;
    selectedToken: TokenIF;
    setWithdrawQty: Dispatch<SetStateAction<string | undefined>>;
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
                    if (parseFloat(event.target.value) > 0) {
                        const nonDisplayQty = fromDisplayQty(
                            event.target.value,
                            selectedToken.decimals,
                        );
                        setWithdrawQty(nonDisplayQty.toString());
                    } else {
                        setWithdrawQty(undefined);
                    }
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
