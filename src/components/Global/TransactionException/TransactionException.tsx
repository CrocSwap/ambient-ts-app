import styles from './TransactionException.module.css';
// import Animation from '../Animation/Animation';
// import NotFound from '../../../assets/animations/NotFound.json';
// import { CircleLoaderFailed } from '../LoadingAnimations/CircleLoader/CircleLoader';
// import { Dispatch, SetStateAction } from 'react';
import Button from '../Button/Button';
import Divider from '../Divider/Divider';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { ZERO_ADDRESS } from '../../../constants';

// interface TransactionSubmittedProps {
//     hash: string;
//     tokenBAddress: string;
//     tokenBSymbol: string;
//     tokenBDecimals: number;
//     tokenBImage: string;
// }

interface TransactionSubmittedProps {
    resetConfirmation: () => void;
    noAnimation?: boolean;
    initiateTx?: () => void;
}

export default function TransactionException(props: TransactionSubmittedProps) {
    const { resetConfirmation, initiateTx } = props;

    const rangeModuleActive = location.pathname.includes('/trade/range');
    const tradeData = useAppSelector((state) => state.tradeData);

    const isEthSecondary =
        (tradeData.isTokenAPrimaryRange && tradeData.tokenB.address === ZERO_ADDRESS) ||
        (!tradeData.isTokenAPrimaryRange && tradeData.tokenA.address === ZERO_ADDRESS);

    const primaryTokenSymbol = tradeData.isTokenAPrimaryRange
        ? tradeData.tokenA.symbol
        : tradeData.tokenB.symbol;

    return (
        <div className={styles.removal_pending}>
            <h2>Transaction Exception</h2>

            {rangeModuleActive && isEthSecondary ? (
                <div>
                    <p>
                        A preliminary simulation of your transaction has failed. We apologize for
                        this inconvenience.
                    </p>
                    <Divider />
                    <p>
                        This may have occurred due to an insufficient ETH balance to cover potential
                        slippage.
                    </p>
                    <Divider />
                    <p>
                        Please try entering a specific amount of ETH, rather than
                        {' ' + primaryTokenSymbol}.
                    </p>
                </div>
            ) : (
                <div>
                    <p>
                        A preliminary simulation of your transaction has failed. We apologize for
                        this inconvenience.
                    </p>
                    <Divider />
                    <p>
                        Check the Metamask extension in your browser for notifications, or click
                        &quot;Try Again&quot;.
                    </p>
                </div>
            )}
            <Button
                title='Try Again'
                action={() => {
                    if (initiateTx) initiateTx();
                    resetConfirmation();
                }}
            />
        </div>
    );
}
