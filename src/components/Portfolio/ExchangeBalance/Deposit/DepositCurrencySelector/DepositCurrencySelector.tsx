import styles from './DepositCurrencySelector.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { Dispatch, SetStateAction } from 'react';
import { fromDisplayQty } from '@crocswap-libs/sdk';
import uriToHttp from '../../../../../utils/functions/uriToHttp';
import NoTokenIcon from '../../../../Global/NoTokenIcon/NoTokenIcon';
import { DefaultTooltip } from '../../../../Global/StyledTooltip/StyledTooltip';

interface propsIF {
    fieldId: string;
    onClick: () => void;
    disable?: boolean;
    selectedToken: TokenIF;
    setDepositQty: Dispatch<SetStateAction<string | undefined>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>;
}

export default function DepositCurrencySelector(props: propsIF) {
    const {
        fieldId,
        disable,
        onClick,
        selectedToken,
        setDepositQty,
        inputValue,
        setInputValue,
    } = props;

    const qtyInput = (
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
                        setDepositQty(nonDisplayQty.toString());
                    } else {
                        setDepositQty(undefined);
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
            />
        </div>
    );

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>Select Token</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>{qtyInput}</div>
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
                                // alt={`logo for token ${token.name}`}
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
