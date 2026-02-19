import { mainnet } from '@reown/appkit/networks';
import { useAppKitNetwork } from '@reown/appkit/react';
import { useContext, useEffect } from 'react';
import { ZERO_ADDRESS } from '../../../../../ambient-utils/constants';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { parseErrorMessage } from '../../../../../utils/TransactionError';
import DividerDark from '../../../../Global/DividerDark/DividerDark';
import TooltipComponent from '../../../../Global/TooltipComponent/TooltipComponent';
import styles from './TransactionException.module.css';

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
    const { switchNetwork } = useAppKitNetwork();
    let txErrorCopyable: string;
    try {
        txErrorCopyable = JSON.stringify(txError);
        if (txErrorCopyable === '{}') {
            txErrorCopyable = txError.toString();
        }
    } catch (error) {
        txErrorCopyable = '';
    }
    const rangeModuleActive = location.pathname.includes('/trade/pool');
    const { tokenA, tokenB, isTokenAPrimary } = useContext(TradeDataContext);
    // const {
    //     activeNetwork: { chainId },
    // } = useContext(AppStateContext);
    useEffect(() => {
        if (txError.reason === 'sending a transaction requires a signer') {
            location.reload();
        } else if (
            txErrorMessage.startsWith('network changed') ||
            (txError.code === 'NETWORK_ERROR' && txError.event === 'changed')
        ) {
            console.log('caught network changed error, switching');
            switchNetwork(mainnet);
        }
    }, [txError]);

    const [_, copy] = useCopyToClipboard();

    const isNativeTokenSecondary =
        (isTokenAPrimary && tokenB.address === ZERO_ADDRESS) ||
        (!isTokenAPrimary && tokenA.address === ZERO_ADDRESS);

    const primaryTokenSymbol = isTokenAPrimary ? tokenA.symbol : tokenB.symbol;

    const isBadRpcError = txErrorMessage === 'not support this call';

    const updatedErrorMessage = isBadRpcError
        ? `Please try a different RPC URL in your wallet. E.g. open Rabby -> press More -> Modify RPC URL and enter any server address found on https://chainlist.org/chain/${Number(chainId)}`
        : txErrorMessage;

    const formattedErrorMessage =
        'Error Message: ' + updatedErrorMessage?.replace('err: ', '');

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
