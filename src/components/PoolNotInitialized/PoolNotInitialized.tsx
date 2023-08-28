import { Link } from 'react-router-dom';
import uriToHttp from '../../utils/functions/uriToHttp';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import TokenIcon from '../Global/TokenIcon/TokenIcon';
import styles from './PoolNotInitialized.module.css';
import {
    setLocalTokenA,
    setLocalTokenB,
} from '../../utils/state/localPairDataSlice';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';

interface PropsIF {
    chainId: string;
    tokenA: TokenIF;
    tokenB: TokenIF;
}

export const PoolNotInitalized = (props: PropsIF) => {
    const { chainId, tokenA, tokenB } = props;

    const linkGenInitPool: linkGenMethodsIF = useLinkGen('initpool');

    const dispatch = useAppDispatch();

    function handleNavigationToInit() {
        console.log('yes fdf');
        dispatch(setLocalTokenA(tokenA));
        dispatch(setLocalTokenB(tokenB));
        console.log('yes');
    }
    return (
        <div className={styles.pool_not_initialialized_container}>
            <div className={styles.pool_init_bg}>
                <div className={styles.pool_not_initialialized_content}>
                    <div className={styles.pool_not_init_inner}>
                        <h2>This pool has not been initialized.</h2>
                        <h3>Do you want to initialize it?</h3>
                        <Link
                            to={linkGenInitPool.getFullURL({
                                chain: chainId,
                                tokenA: tokenA.address,
                                tokenB: tokenB.address,
                            })}
                            className={styles.initialize_link}
                            onClick={() => handleNavigationToInit()}
                        >
                            Initialize Pool
                            <TokenIcon
                                token={tokenA}
                                src={uriToHttp(tokenA.logoURI)}
                                alt={tokenA.symbol}
                                size='m'
                            />
                            <TokenIcon
                                token={tokenB}
                                src={uriToHttp(tokenB.logoURI)}
                                alt={tokenB.symbol}
                                size='m'
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
