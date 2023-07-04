import styles from './TransactionException.module.css';
import Button from '../Button/Button';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { ZERO_ADDRESS } from '../../../constants';
import DividerDark from '../DividerDark/DividerDark';

interface propsIF {
    resetConfirmation: () => void;
    initiateTx?: () => void;
}

export default function TransactionException(props: propsIF) {
    const { resetConfirmation, initiateTx } = props;

    const rangeModuleActive = location.pathname.includes('/trade/pool');
    const tradeData = useAppSelector((state) => state.tradeData);

    const isEthSecondary =
        (tradeData.isTokenAPrimaryRange &&
            tradeData.tokenB.address === ZERO_ADDRESS) ||
        (!tradeData.isTokenAPrimaryRange &&
            tradeData.tokenA.address === ZERO_ADDRESS);

    const primaryTokenSymbol = tradeData.isTokenAPrimaryRange
        ? tradeData.tokenA.symbol
        : tradeData.tokenB.symbol;

    return (
        <div className={styles.removal_pending}>
            <h2>Transaction Exception</h2>

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
                    <p>
                        Please check your wallet for notifications or try again.
                    </p>
                </>
            )}
            <Button
                flat
                title='Try Again'
                action={() => {
                    if (initiateTx) initiateTx();
                    resetConfirmation();
                }}
            />
        </div>
    );
}
