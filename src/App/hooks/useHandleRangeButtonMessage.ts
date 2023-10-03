import { useMemo } from 'react';
import { TokenIF } from '../../utils/interfaces/TokenIF';

export function useHandleRangeButtonMessage(
    token: TokenIF,
    tokenAmount: string,
    tokenBalance: string,
    tokenDexBalance: string,
    isTokenInputDisabled: boolean,
    isWithdrawTokenFromDexChecked: boolean,
    isPoolInitialized: boolean,
) {
    const { tokenAllowed, rangeButtonErrorMessage } = useMemo(() => {
        console.log('Token Amount: ', token.symbol, { tokenAmount, token });
        let tokenAllowed = false;
        let rangeButtonErrorMessage = '';
        if (!isPoolInitialized) {
            rangeButtonErrorMessage = 'Pool Not Initialized';
        } else if (
            (isNaN(parseFloat(tokenAmount)) || parseFloat(tokenAmount) <= 0) &&
            !isTokenInputDisabled
        ) {
            rangeButtonErrorMessage = 'Enter an Amount';
        } else {
            if (isWithdrawTokenFromDexChecked) {
                if (
                    parseFloat(tokenAmount) >
                    parseFloat(tokenDexBalance) + parseFloat(tokenBalance)
                ) {
                    rangeButtonErrorMessage = `${token.symbol} Amount Exceeds Combined Wallet and Exchange Balance`;
                } else {
                    tokenAllowed = true;
                }
            } else {
                if (parseFloat(tokenAmount) > parseFloat(tokenBalance)) {
                    rangeButtonErrorMessage = `${token.symbol} Amount Exceeds Wallet Balance`;
                } else {
                    tokenAllowed = true;
                }
            }
        }
        return {
            tokenAllowed,
            rangeButtonErrorMessage,
        };
    }, [
        tokenAmount,
        tokenBalance,
        tokenDexBalance,
        isTokenInputDisabled,
        isWithdrawTokenFromDexChecked,
        isPoolInitialized,
    ]);

    return {
        tokenAllowed,
        rangeButtonErrorMessage,
    };
}
