import styles from './TransactionException.module.css';
import { ZERO_ADDRESS } from '../../../../../ambient-utils/constants';
import DividerDark from '../../../../Global/DividerDark/DividerDark';
import { useContext, useEffect } from 'react';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';
import TooltipComponent from '../../../../Global/TooltipComponent/TooltipComponent';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { parseErrorMessage } from '../../../../../utils/TransactionError';
import { useSwitchNetwork } from '@web3modal/ethers/react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';

interface propsIF {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txError: any;
}

export default function TransactionException(props: propsIF) {
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const { txError } = props;
    const txErrorMessage = parseErrorMessage(txError);
    let txErrorCopyable = JSON.stringify(txError);
    if (txErrorCopyable === '{}') {
        try {
            txErrorCopyable = txError.toString();
        } catch {
            txErrorCopyable = '';
        }
    }
    const rangeModuleActive = location.pathname.includes('/trade/pool');
    const { tokenA, tokenB, isTokenAPrimary } = useContext(TradeDataContext);
    const { chainData } = useContext(CrocEnvContext);
    useEffect(() => {
        if (txError.reason === 'sending a transaction requires a signer') {
            location.reload();
        } else if (
            txErrorMessage.startsWith('network changed') ||
            (txError.code === 'NETWORK_ERROR' && txError.event === 'changed')
        ) {
            console.log('caught network changed error, switching');
            useSwitchNetwork().switchNetwork(Number(chainData.chainId));
        }
    }, [txError]);

    const [_, copy] = useCopyToClipboard();

    const isNativeTokenSecondary =
        (isTokenAPrimary && tokenB.address === ZERO_ADDRESS) ||
        (!isTokenAPrimary && tokenA.address === ZERO_ADDRESS);

    const primaryTokenSymbol = isTokenAPrimary ? tokenA.symbol : tokenB.symbol;

    const formattedErrorMessage =
        'Error Message: ' + txErrorMessage?.replace('err: ', '');

    function handleCopyErrorMessage() {
        copy(txErrorCopyable);
        openSnackbar('Error message copied to clipboard', 'info');
    }
    const suggestionToCheckWalletETHBalance = (
        <p>
            Please verify that the native token (e.g. ETH) balance in your
            wallet is sufficient to cover the cost of gas.
        </p>
    );

    const isSlippageError =
        txErrorMessage === 'execution reverted: K' ||
        txErrorMessage === 'Internal JSON-RPC error.';

    return (
        <div className={styles.removal_pending}>
            {rangeModuleActive && isNativeTokenSecondary ? (
                <>
                    <p>
                        A preliminary simulation of your transaction has failed.
                        We apologize for this inconvenience.
                    </p>
                    <DividerDark />
                    <p>
                        Please try entering a specific amount of the native
                        token (e.g. ETH), rather than
                        {' ' + primaryTokenSymbol}.
                    </p>
                    <DividerDark />
                    <p>
                        This may have occurred due to an insufficient native
                        token balance to cover potential slippage.
                    </p>
                </>
            ) : (
                <>
                    <p>
                        A preliminary simulation of your transaction has failed.
                        We apologize for this inconvenience.
                    </p>
                    <DividerDark />
                    <div className={styles.formatted_error_container}>
                        <p className={styles.formatted_error}>
                            {formattedErrorMessage}
                        </p>

                        {txErrorCopyable && txErrorCopyable !== '{}' && (
                            <button
                                className={styles.copy_error}
                                onClick={handleCopyErrorMessage}
                            >
                                Copy Error Message to Clipboard
                                <TooltipComponent
                                    title='If you have any questions or need further assistance, please open a ticket on Discord (#open-a-ticket) and paste this error message. https://discord.gg/ambient-finance'
                                    placement='bottom'
                                />
                            </button>
                        )}
                    </div>
                    <DividerDark />

                    {!txErrorMessage ? (
                        suggestionToCheckWalletETHBalance
                    ) : isSlippageError ? (
                        <p>
                            Consider increasing your slippage tolerance in
                            settings.
                        </p>
                    ) : (
                        <p>
                            Please check your wallet for notifications or try
                            again.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
