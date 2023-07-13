import { Dispatch, SetStateAction } from 'react';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { fromDisplayQty } from '@crocswap-libs/sdk';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';
import TokenInput from '../../../../Global/TokenInput/TokenInput';

interface propsIF {
    fieldId: string;
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
        selectedToken,
        setWithdrawQty,
        inputValue,
        setInputValue,
    } = props;

    const handleOnChange = (input: string) => {
        setInputValue(input);
        setWithdrawQty(
            input === ''
                ? ''
                : fromDisplayQty(
                      input.replaceAll(',', ''),
                      selectedToken.decimals,
                  ).toString(),
        );
    };

    const parseInput = () => {
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

    return (
        <TokenInput
            label='Select Token'
            fieldId={fieldId}
            tokenAorB={null}
            value={inputValue}
            handleChangeEvent={(e) => handleOnChange(e.target.value)}
            parseInput={parseInput}
            disable={disable}
            token={selectedToken}
        />
    );
}
