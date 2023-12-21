import { useMemo } from 'react';
import { TokenIF } from '../../ambient-utils/types';
import { ZERO_ADDRESS } from '../../ambient-utils/constants';

export function useHandleRangeButtonMessage(
    token: TokenIF,
    tokenAmount: string,
    tokenBalance: string,
    tokenDexBalance: string,
    isTokenInputDisabled: boolean,
    isWithdrawTokenFromDexChecked: boolean,
    isPoolInitialized: boolean,
    tokenQtyCoveredByWalletBalance: number,
    amountToReduceNativeTokenQty: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isMintLiqEnabled = true,
    isInitPage = false,
) {
    const { tokenAllowed, rangeButtonErrorMessage } = useMemo(() => {
        let tokenAllowed = false;
        let rangeButtonErrorMessage = '';

        const isNativeToken = token.address === ZERO_ADDRESS;

        if (!isPoolInitialized) {
            rangeButtonErrorMessage = 'Pool Not Initialized';
        } else if (isInitPage && parseFloat(tokenBalance) <= 0) {
            tokenAllowed = false;
            rangeButtonErrorMessage = `${token.symbol} Wallet Balance Insufficient`;
        } else if (
            (isNaN(parseFloat(tokenAmount)) || parseFloat(tokenAmount) <= 0) &&
            !isTokenInputDisabled
        ) {
            rangeButtonErrorMessage = 'Enter an Amount';
        } else {
            if (isWithdrawTokenFromDexChecked) {
                if (
                    !isTokenInputDisabled &&
                    parseFloat(tokenAmount) >
                        parseFloat(tokenDexBalance) + parseFloat(tokenBalance)
                ) {
                    rangeButtonErrorMessage = `${token.symbol} Amount Exceeds Combined Wallet and Exchange Balance`;
                } else if (
                    isNativeToken &&
                    tokenQtyCoveredByWalletBalance +
                        amountToReduceNativeTokenQty >
                        parseFloat(tokenBalance) + 0.0000000001 // offset to account for floating point math inconsistencies
                ) {
                    tokenAllowed = false;
                    rangeButtonErrorMessage = `${token.symbol} Wallet Balance Insufficient to Cover Gas`;
                } else {
                    tokenAllowed = true;
                }
            } else {
                if (
                    !isTokenInputDisabled &&
                    parseFloat(tokenAmount) > parseFloat(tokenBalance)
                ) {
                    rangeButtonErrorMessage = `${token.symbol} Amount Exceeds Wallet Balance`;
                } else if (
                    isNativeToken &&
                    tokenQtyCoveredByWalletBalance +
                        amountToReduceNativeTokenQty >
                        parseFloat(tokenBalance) + 0.0000000001 // offset to account for floating point math inconsistencies
                ) {
                    tokenAllowed = false;
                    rangeButtonErrorMessage = `${token.symbol} Wallet Balance Insufficient to Cover Gas`;
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
        token.address,
        token.symbol,
        isPoolInitialized,
        isInitPage,
        tokenBalance,
        tokenAmount,
        isTokenInputDisabled,
        isWithdrawTokenFromDexChecked,
        tokenDexBalance,
        tokenQtyCoveredByWalletBalance,
        amountToReduceNativeTokenQty,
    ]);

    return {
        tokenAllowed,
        rangeButtonErrorMessage,
    };
}
