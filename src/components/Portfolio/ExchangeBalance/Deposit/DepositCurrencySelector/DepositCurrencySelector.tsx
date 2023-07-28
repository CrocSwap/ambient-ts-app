import styles from './DepositCurrencySelector.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { Dispatch, SetStateAction } from 'react';
import { fromDisplayQty } from '@crocswap-libs/sdk';
import uriToHttp from '../../../../../utils/functions/uriToHttp';
import { DefaultTooltip } from '../../../../Global/StyledTooltip/StyledTooltip';
import TokenIcon from '../../../../Global/TokenIcon/TokenIcon';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';

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

    const handleOnChange = (input: string) => {
        setInputValue(input);
        setDepositQty(
            input === ''
                ? ''
                : fromDisplayQty(
                      input.replaceAll(',', ''),
                      selectedToken.decimals,
                  ).toString(),
        );
    };

    const handleOnBlur = () => {
        const inputNum = parseFloat(inputValue);
        if (!isNaN(inputNum)) {
            const formattedInputStr = getFormattedNumber({
                value: inputNum,
                isToken: true,
                removeCommas: true,
                minFracDigits: selectedToken.decimals,
                maxFracDigits: selectedToken.decimals,
            });
            setInputValue(formattedInputStr);
        }
    };

    const qtyInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                className={styles.currency_quantity}
                placeholder='0.00'
                onBlur={handleOnBlur}
                onChange={(e) => handleOnChange(e.target.value)}
                value={inputValue}
                type='number'
                step='any'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
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
                        <TokenIcon
                            src={uriToHttp(selectedToken.logoURI)}
                            alt={selectedToken.symbol}
                            size='2xl'
                        />
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
