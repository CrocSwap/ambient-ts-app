import styles from './TransactionException.module.css';
import { ZERO_ADDRESS } from '../../../../../ambient-utils/constants';
import DividerDark from '../../../../Global/DividerDark/DividerDark';
import { useContext } from 'react';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';
import { RangeContext } from '../../../../../contexts/RangeContext';

interface propsIF {
    txErrorMessage: string;
}

export default function TransactionException(props: propsIF) {
    const { txErrorMessage } = props;
    const rangeModuleActive = location.pathname.includes('/trade/pool');
    const { isTokenAPrimaryRange } = useContext(RangeContext);
    const { tokenA, tokenB } = useContext(TradeDataContext);

    const isEthSecondary =
        (isTokenAPrimaryRange && tokenB.address === ZERO_ADDRESS) ||
        (!isTokenAPrimaryRange && tokenA.address === ZERO_ADDRESS);

    const primaryTokenSymbol = isTokenAPrimaryRange
        ? tokenA.symbol
        : tokenB.symbol;

    const formattedErrorMessage =
        'Error Message: ' + txErrorMessage.replace('err: ', '');

    return (
        <div className={styles.removal_pending}>
            {rangeModuleActive && isEthSecondary ? (
                <>
                    <p>
                        A preliminary simulation of your transaction has failed.
                        We apologize for this inconvenience.
                    </p>
                    <DividerDark />
                    <p>
                        This may have occurred due to an insufficient ETH
                        balance to cover potential slippage.
                    </p>
                    <DividerDark />
                    <p>
                        Please try entering a specific amount of ETH, rather
                        than
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
                    <p>
                        Please check your wallet for notifications or try again.
                    </p>
                </>
            )}
        </div>
    );
}
