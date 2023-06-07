import styles from './WithdrawCurrencySelector.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';
import { Dispatch, SetStateAction } from 'react';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { fromDisplayQty } from '@crocswap-libs/sdk';
import NoTokenIcon from '../../../../Global/NoTokenIcon/NoTokenIcon';
import uriToHttp from '../../../../../utils/functions/uriToHttp';
import { DefaultTooltip } from '../../../../Global/StyledTooltip/StyledTooltip';
import { exponentialNumRegEx } from '../../../../../utils/regex/exports';

interface propsIF {
    fieldId: string;
    onClick: () => void;
    disable?: boolean;
    selectedToken: TokenIF;
    setWithdrawQty: Dispatch<SetStateAction<string | undefined>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>;
}

export default function WithdrawCurrencySelector(props: propsIF) {
    const {
        fieldId,
        disable,
        onClick,
        selectedToken,
        setWithdrawQty,
        inputValue,
        setInputValue,
    } = props;

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                className={styles.currency_quantity}
                placeholder='0.00'
                onChange={(event) => {
                    const isValid =
                        event.target.value === '' ||
                        event.target.validity.valid;
                    isValid ? setInputValue(event.target.value) : null;
                    if (parseFloat(event.target.value) > 0) {
                        const nonDisplayQty = fromDisplayQty(
                            event.target.value.replaceAll(',', ''),
                            selectedToken.decimals,
                        );
                        setWithdrawQty(nonDisplayQty.toString());
                    } else {
                        setWithdrawQty(undefined);
                    }
                }}
                value={inputValue}
                type='text'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern={exponentialNumRegEx.source}
                disabled={disable}
            />
        </div>
    );

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>Select Token</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>{rateInput}</div>
                <DefaultTooltip
                    interactive
                    title={`${selectedToken.symbol + ':'} ${
                        selectedToken.address
                    }`}
                    placement={'top'}
                    enterDelay={200}
                >
                    <div className={styles.token_select} onClick={onClick}>
                        {selectedToken.logoURI ? (
                            <img
                                className={styles.token_list_img}
                                src={uriToHttp(selectedToken.logoURI)}
                                alt={selectedToken.symbol?.charAt(0)}
                                width='30px'
                            />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={selectedToken.symbol?.charAt(0)}
                                width='30px'
                            />
                        )}

                        <span className={styles.token_list_text}>
                            {selectedToken.symbol}
                        </span>
                        <RiArrowDownSLine size={27} />
                    </div>
                </DefaultTooltip>
            </div>
        </div>
    );
}
