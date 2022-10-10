import { useEffect } from 'react';
import styles from './InitPool.module.css';
import { useUrlParams } from './useUrlParams';
// import InitPoolSteps from '../../components/InitPool/InitPoolSteps/InitPoolSteps';
// import InitPoolSummary from '../../components/InitPool/InitPoolSummary/InitPoolSummary';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import Button from '../../components/Global/Button/Button';

import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { useNavigate } from 'react-router-dom';
import { VscClose } from 'react-icons/vsc';
import InitPoolExtraInfo from '../../components/InitPool/InitPoolExtraInfo/InitPoolExtraInfo';

// const animationsNext = {
//     initial: { opacity: 0, x: 30 },
//     animate: { opacity: 1, x: 0 },
//     exit: { opacity: 0, x: -100 },
// };
// const animationsBack = {
//     initial: { opacity: 0, x: -30 },
//     animate: { opacity: 1, x: 0 },
//     exit: { opacity: 0, x: -100 },
// };

interface InitPoolPropsIf {
    poolExists: boolean|null;
    showSidebar: boolean;
}
export default function InitPool(props: InitPoolPropsIf) {
    const { poolExists, showSidebar } = props;
    const newPoolData = useUrlParams();
    const tradeData = useAppSelector((state) => state.tradeData);

    const tokenA = tradeData.tokenA;
    const tokenB = tradeData.tokenB;
    const navigate = useNavigate();
    useEffect(() => {
        console.log(newPoolData);
        poolExists && navigate(
            '/trade/market/chain=0x5&tokenA=' +
            newPoolData.baseAddr +
            '&tokenB=' +
            newPoolData.quoteAddr
        );
    }, [poolExists]);

    console.log(newPoolData);
    // const [progressStep, setProgressStep] = useState(0);
    // const [animation, setAnimation] = useState(animationsNext);

    const initialPoolPriceDisplay = (
        <div className={styles.pool_price_container}>
            <span>Initial Price</span>
            <section>
                <input
                    id={'initial-pool-price-quantity'}
                    className={styles.currency_quantity}
                    placeholder='e.g. 1500 (ETH/TokenX)'
                    // onChange={(event) => handleLimitChange(event.target.value)}

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
                    {/* <InitPoolSummary /> */}
                </div>
            </div>
        </main>
    );
}
