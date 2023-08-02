import { VscClose } from 'react-icons/vsc';
import { Link, useNavigate } from 'react-router-dom';
import uriToHttp from '../../utils/functions/uriToHttp';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import TokenIcon from '../Global/TokenIcon/TokenIcon';
import styles from './PoolNotInitialized.module.css';

interface PropsIF {
    chainId: string;
    tokenA: TokenIF;
    tokenB: TokenIF;
}

export const PoolNotInitalized = (props: PropsIF) => {
    const { chainId, tokenA, tokenB } = props;

    const navigate = useNavigate();
    const linkGenInitPool: linkGenMethodsIF = useLinkGen('initpool');

    return (
        <div className={styles.pool_not_initialialized_container}>
            <div className={styles.pool_init_bg}>
                <div className={styles.pool_not_initialialized_content}>
                    <div
                        className={styles.close_init}
                        onClick={() => navigate(-1)}
                    >
                        <VscClose size={28} />
                    </div>
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
                        <button
                            className={styles.no_thanks}
                            onClick={() => navigate(-1)}
                        >
                            No, take me back.
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
