import styles from './TransactionException.module.css';
import { ZERO_ADDRESS } from '../../../../../ambient-utils/constants';
import DividerDark from '../../../../Global/DividerDark/DividerDark';
import { useContext } from 'react';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';

interface propsIF {
    txErrorMessage: string;
}

export default function TransactionException(props: propsIF) {
    const { txErrorMessage } = props;
    const rangeModuleActive = location.pathname.includes('/trade/pool');
    const { tokenA, tokenB, isTokenAPrimary } = useContext(TradeDataContext);

    const isNativeTokenSecondary =
        (isTokenAPrimary && tokenB.address === ZERO_ADDRESS) ||
        (!isTokenAPrimary && tokenA.address === ZERO_ADDRESS);

    const primaryTokenSymbol = isTokenAPrimary ? tokenA.symbol : tokenB.symbol;

    const formattedErrorMessage =
        'Error Message: ' + txErrorMessage?.replace('err: ', '');

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
                        This may have occurred due to an insufficient native
                        token (e.g. ETH) balance to cover potential slippage.
                    </p>
                    <DividerDark />
                    <p>
                        Please try entering a specific amount of the native
                        token, rather than
                        {' ' + primaryTokenSymbol}.
                    </p>
                </>
            ) : (
                <>
                    <p>
                        A preliminary simulation of your transaction has failed.
                        We apologize for this inconvenience.
                    </p>
                    <DividerDark />
                    <p>{formattedErrorMessage}</p>
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
