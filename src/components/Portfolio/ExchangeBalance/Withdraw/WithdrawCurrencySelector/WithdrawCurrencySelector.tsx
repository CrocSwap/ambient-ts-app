import styles from './WithdrawCurrencySelector.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';
import { Dispatch, SetStateAction } from 'react';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { fromDisplayQty } from '@crocswap-libs/sdk';
import uriToHttp from '../../../../../utils/functions/uriToHttp';
import { DefaultTooltip } from '../../../../Global/StyledTooltip/StyledTooltip';
import { decimalNumRegEx } from '../../../../../utils/regex/exports';
import TokenIcon from '../../../../Global/TokenIcon/TokenIcon';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';

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

    const handleOnChange = (input: string) => {
        setInputValue(input);
        setWithdrawQty(
            fromDisplayQty(
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

    const rateInput = (
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
                pattern={decimalNumRegEx.source}
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
                        <TokenIcon
                            src={uriToHttp(selectedToken.logoURI)}
                            alt={selectedToken.symbol?.charAt(0)}
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
