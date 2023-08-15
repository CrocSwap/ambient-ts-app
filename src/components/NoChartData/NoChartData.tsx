import { Link } from 'react-router-dom';
import uriToHttp from '../../utils/functions/uriToHttp';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import TokenIcon from '../Global/TokenIcon/TokenIcon';
import styles from './NoChartData.module.css';
import { FiRefreshCcw } from 'react-icons/fi';
import { useContext } from 'react';
import { CandleContext } from '../../contexts/CandleContext';

interface PropsIF {
    chainId: string;
    tokenA: TokenIF;
    tokenB: TokenIF;

    isCandleDataNull: boolean;
}

export const NoChartData = (props: PropsIF) => {
    const { chainId, tokenA, tokenB, isCandleDataNull } = props;
    const { setIsManualCandleFetchRequested } = useContext(CandleContext);

    const linkGenInitPool: linkGenMethodsIF = useLinkGen('initpool');

    const refreshCandleButton = (
        <button
            className={styles.initialize_link}
            onClick={() => setIsManualCandleFetchRequested(true)}
        >
            Re-fetch data
            <FiRefreshCcw size={22} color='var(--text1)' />
        </button>
    );

    return (
        <div className={styles.pool_not_initialialized_container}>
            <div className={styles.pool_init_bg}>
                <div className={styles.pool_not_initialialized_content}>
                    <div className={styles.pool_not_init_inner}>
                        <h2>
                            {isCandleDataNull
                                ? 'Candle data not available.'
                                : 'This pool has not been initialized.'}
                        </h2>
                        <h3>
                            {isCandleDataNull
                                ? ''
                                : 'Do you want to initialize it?'}
                        </h3>
                        {isCandleDataNull ? (
                            refreshCandleButton
                        ) : (
                            <Link
                                to={linkGenInitPool.getFullURL({
                                    chain: chainId,
                                    tokenA: tokenA.address,
                                    tokenB: tokenB.address,
                                })}
                                className={styles.initialize_link}
                            >
                                Initialize Pool
                                <TokenIcon
                                    src={uriToHttp(tokenA.logoURI)}
                                    alt={tokenA.symbol}
                                    size='m'
                                />
                                <TokenIcon
                                    src={uriToHttp(tokenB.logoURI)}
                                    alt={tokenB.symbol}
                                    size='m'
                                />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
