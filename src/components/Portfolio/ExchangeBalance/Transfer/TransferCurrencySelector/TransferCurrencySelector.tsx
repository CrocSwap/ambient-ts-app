import { TokenIF } from '../../../../../utils/interfaces/exports';
import { Dispatch, memo, SetStateAction } from 'react';
import { fromDisplayQty } from '@crocswap-libs/sdk';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';
import TokenInput from '../../../../Global/TokenInput/TokenInput';

interface propsIF {
    fieldId: string;
    disable?: boolean;
    selectedToken: TokenIF;
    setTransferQty: Dispatch<SetStateAction<string | undefined>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>;
}

function TransferCurrencySelector(props: propsIF) {
    const {
        fieldId,
        disable,
        selectedToken,
        setTransferQty,
        inputValue,
        setInputValue,
    } = props;

    const handleOnChange = (input: string) => {
        setInputValue(input);
        setTransferQty(
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

export default memo(TransferCurrencySelector);
