import { fromDisplayQty } from '@crocswap-libs/sdk';
import { Dispatch, memo, SetStateAction } from 'react';
import { TokenIF } from '../../ambient-utils/types';
import TokenInputQuantity from './TokenInputQuantity';

interface propsIF {
    disable?: boolean;
    selectedToken: TokenIF;
    setQty: Dispatch<SetStateAction<string | undefined>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>;
    setTokenModalOpen?: Dispatch<SetStateAction<boolean>>;
    customBorderRadius?: string;
    noModals?: boolean;
    usdValue?: string | undefined;
    walletBalance?: string;
    handleBalanceClick?: () => void;
}

export function CurrencySelector(props: propsIF) {
    const {
        disable,
        selectedToken,
        setQty: setDepositQty,
        inputValue,
        setInputValue,
        setTokenModalOpen,
        customBorderRadius,
        usdValue,
        noModals,
        walletBalance,
        handleBalanceClick,
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

    return (
        <TokenInputQuantity
            label={customBorderRadius ? '' : 'Select Token'}
            tokenAorB={null}
            value={inputValue}
            handleTokenInputEvent={handleOnChange}
            disable={disable}
            token={selectedToken}
            setTokenModalOpen={setTokenModalOpen}
            fieldId='exchangeBalance'
            customBorderRadius={customBorderRadius}
            noModals={noModals}
            usdValue={usdValue}
            walletBalance={walletBalance}
            handleBalanceClick={handleBalanceClick}
        />
    );
}

export default memo(CurrencySelector);
