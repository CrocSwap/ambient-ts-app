import { MutableRefObject, useContext, useMemo } from 'react';
import { TokenIF } from '../../ambient-utils/types';
import { ZERO_ADDRESS } from '../../ambient-utils/constants';
import { ReceiptContext } from '../../contexts/ReceiptContext';

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
    activeRangeTxHash: MutableRefObject<string>,
    clearTokenInputs: () => void,
    isMintLiqEnabled = true,
    isInitPage = false,
) {
    const { pendingTransactions } = useContext(ReceiptContext);

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
                    if (
                        pendingTransactions.some(
                            (tx) => tx === activeRangeTxHash.current,
                        )
                    ) {
                        clearTokenInputs();
                    }
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
                    if (
                        pendingTransactions.some(
                            (tx) => tx === activeRangeTxHash.current,
                        )
                    ) {
                        clearTokenInputs();
                    }
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
        isMintLiqEnabled,
        tokenAmount,
        tokenQtyCoveredByWalletBalance,
        amountToReduceNativeTokenQty,
        tokenBalance,
        tokenDexBalance,
        isTokenInputDisabled,
        isWithdrawTokenFromDexChecked,
        isPoolInitialized,
        pendingTransactions,
        activeRangeTxHash,
    ]);

    return {
        tokenAllowed,
        rangeButtonErrorMessage,
    };
}
