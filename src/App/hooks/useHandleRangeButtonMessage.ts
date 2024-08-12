import { MutableRefObject, useContext, useMemo } from 'react';
import { TokenIF } from '../../ambient-utils/types';
import { ZERO_ADDRESS } from '../../ambient-utils/constants';
import { ReceiptContext } from '../../contexts/ReceiptContext';
import { fromDisplayQty } from '@crocswap-libs/sdk';

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
        } else if (
            isInitPage &&
            fromDisplayQty(tokenBalance || '0', token.decimals) <= 0
        ) {
            tokenAllowed = false;
            rangeButtonErrorMessage = `${token.symbol} Wallet Balance Insufficient`;
        } else if (
            fromDisplayQty(tokenAmount || '0', token.decimals) <= 0 &&
            !isTokenInputDisabled
        ) {
            rangeButtonErrorMessage = 'Enter an Amount';
        } else {
            if (isWithdrawTokenFromDexChecked) {
                if (
                    !isTokenInputDisabled &&
                    fromDisplayQty(tokenAmount, token.decimals) >
                        fromDisplayQty(tokenDexBalance, token.decimals) +
                            fromDisplayQty(tokenBalance, token.decimals)
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
                    fromDisplayQty(
                        tokenQtyCoveredByWalletBalance.toString(),
                        token.decimals,
                    ) +
                        fromDisplayQty(
                            amountToReduceNativeTokenQty.toString(),
                            token.decimals,
                        ) >
                        fromDisplayQty(tokenBalance, 18) +
                            fromDisplayQty('0.0000000001', 18) // offset to account for floating point math inconsistencies
                ) {
                    tokenAllowed = false;
                    rangeButtonErrorMessage = `${token.symbol} Wallet Balance Insufficient to Cover Gas`;
                } else {
                    tokenAllowed = true;
                }
            } else {
                if (
                    !isTokenInputDisabled &&
                    fromDisplayQty(tokenAmount || '0', token.decimals) >
                        fromDisplayQty(tokenBalance || '0', token.decimals)
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
                    fromDisplayQty(
                        tokenQtyCoveredByWalletBalance.toString(),
                        token.decimals,
                    ) +
                        fromDisplayQty(
                            amountToReduceNativeTokenQty.toString(),
                            token.decimals,
                        ) >
                        fromDisplayQty(tokenBalance, 18) +
                            fromDisplayQty('0.0000000001', 18) // offset to account for floating point math inconsistencies
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
