import { TokenIF } from '../../../../../utils/interfaces/exports';
import { Dispatch, memo, SetStateAction } from 'react';
import { fromDisplayQty } from '@crocswap-libs/sdk';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';
import TokenInputQuantity from '../../../../Global/TokenInput/TokenInputQuantity';

interface propsIF {
    disable?: boolean;
    selectedToken: TokenIF;
    setTransferQty: Dispatch<SetStateAction<string | undefined>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>;
    setTokenModalOpen: Dispatch<SetStateAction<boolean>>;
}

function TransferCurrencySelector(props: propsIF) {
    const {
        disable,
        selectedToken,
        setTransferQty,
        inputValue,
        setInputValue,
        setTokenModalOpen,
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
        <TokenInputQuantity
            label='Select Token'
            tokenAorB={null}
            value={inputValue}
            handleTokenInputEvent={handleOnChange}
            parseInput={parseInput}
            disable={disable}
            token={selectedToken}
            setTokenModalOpen={setTokenModalOpen}
            fieldId='exchangeBalance'
        />
    );
}

export default memo(TransferCurrencySelector);
