import { useEffect, useState } from 'react';
import { CrocEnv } from '@crocswap-libs/sdk';
import styles from './InitPool.module.css';
import { useUrlParams } from './useUrlParams';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import Button from '../../components/Global/Button/Button';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { Navigate, useNavigate } from 'react-router-dom';
import { VscClose } from 'react-icons/vsc';
import InitPoolExtraInfo from '../../components/InitPool/InitPoolExtraInfo/InitPoolExtraInfo';

interface InitPoolPropsIf {
    crocEnv: CrocEnv|undefined;
    showSidebar: boolean;
}
export default function InitPool(props: InitPoolPropsIf) {
    const { crocEnv, showSidebar } = props;

    const newPoolData = useUrlParams();
    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

    const navigate = useNavigate();

    // DO NOT combine these hooks with useMemo()
    // the useMemo() hook does NOT respect asynchronicity
    const [poolExists, setPoolExists] = useState<boolean|null>(null);
    useEffect(() => {
        // make sure crocEnv exists (needs a moment to spin up)
        if (crocEnv) {
            // check if pool exists for token addresses from URL params
            const doesPoolExist = crocEnv
                .pool(newPoolData.baseAddr as string, newPoolData.quoteAddr as string)
                .isInit();
            // resolve the promise
            Promise.resolve(doesPoolExist)
                // update value of poolExists, use `null` for `undefined`
                .then(res => setPoolExists(res ?? null));
        } else {
            // set value of poolExists as null if there is no crocEnv
            // this is handled as a pre-initialization condition, not a false
            setPoolExists(null);
        }
    // re-run hook if a new crocEnv is created
    // this will happen if the user switches chains
    }, [crocEnv]);

    const initialPoolPriceDisplay = (
        <div className={styles.pool_price_container}>
            <span>Initial Price</span>
            <section>
                <input
                    id={'initial-pool-price-quantity'}
                    className={styles.currency_quantity}
                    placeholder='e.g. 1500 (ETH/TokenX)'
                    type='string'
                    inputMode='decimal'
                    autoComplete='off'
                    autoCorrect='off'
                    min='0'
                    minLength={1}
                    pattern='^[0-9]*[.,]?[0-9]*$'
                    required
                />
            </section>
        </div>
    );

    const poolDisplay = (
        <div className={styles.pool_display_container}>
            <div className={styles.pool_display}>
                <div>
                    <img src={tokenA.logoURI} alt='token a' />
                    <h3>{tokenA.symbol}</h3>
                </div>
                <p>{tokenA.name}</p>
            </div>

            <div className={styles.pool_display}>
                <div>
                    <img src={tokenB.logoURI} alt='token b' />
                    <h3>{tokenB.symbol}</h3>
                </div>
                <p>{tokenB.name}</p>
            </div>
            {initialPoolPriceDisplay}
            <InitPoolExtraInfo />
        </div>
    );

    return (
        <main
            className={styles.main}
            style={{ justifyContent: showSidebar ? 'flex-start' : 'center' }}
        >
            {
                poolExists &&
                <Navigate
                    to={
                        '/trade/market/chain=0x5&tokenA=' +
                        newPoolData.baseAddr +
                        '&tokenB=' +
                        newPoolData.quoteAddr
                    }
                    replace={true}
                />
            }
            <div
                className={styles.init_pool_container}
                style={{ marginLeft: showSidebar ? '15rem' : '' }}
            >
                <div className={styles.back_button} onClick={() => navigate(-1)}>
                    <VscClose size={30} />
                </div>
                <div className={styles.top_content}>
                    <ContentContainer>
                        <header>
                            <h1>INITIALIZE POOL</h1>
                        </header>
                        {poolDisplay}
                        <footer>
                            <Button title='Next' action={() => console.log('completed')} />
                        </footer>
                    </ContentContainer>
                </div>
            </div>
        </main>
    );
}
