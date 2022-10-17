// START: Import React and Dongles
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { VscClose } from 'react-icons/vsc';
import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenIF, TokenListIF } from '../../utils/interfaces/exports';

// START: Import JSX Components
import InitPoolExtraInfo from '../../components/InitPool/InitPoolExtraInfo/InitPoolExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import Button from '../../components/Global/Button/Button';

// START: Import Local Files
import styles from './InitPool.module.css';
import { useUrlParams } from './useUrlParams';

// interface for props
interface InitPoolPropsIF {
    crocEnv: CrocEnv|undefined;
    showSidebar: boolean;
}

// react functional component
export default function InitPool(props: InitPoolPropsIF) {
    const { crocEnv, showSidebar } = props;

    // URL parameters
    const { baseAddr, quoteAddr } = useUrlParams();

    // function to programmatically navigate the user
    const navigate = useNavigate();

    // DO NOT combine these hooks with useMemo()
    // the useMemo() hook does NOT respect asynchronicity
    const [poolExists, setPoolExists] = useState<boolean|null>(null);
    useEffect(() => {
        // make sure crocEnv exists (needs a moment to spin up)
        if (crocEnv) {
            // check if pool exists for token addresses from URL params
            const doesPoolExist = crocEnv
                .pool(baseAddr as string, quoteAddr as string)
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

    const [tokenList, setTokenList] = useState<TokenIF[]|null>(null);
    const [tokenA, setTokenA] = useState<TokenIF|null>(null);
    const [tokenB, setTokenB] = useState<TokenIF|null>(null);
    useEffect(() => {
        // get allTokenLists from local storage
        function check() {
            const tokenListsFromStorage = localStorage.getItem('allTokenLists');
            if (tokenListsFromStorage !== null) {
                const tokenLists = JSON.parse(tokenListsFromStorage as string);
                const tokens = tokenLists.find((list: TokenListIF) => list.name === 'Ambient Token List').tokens;
                console.log(tokens);
                setTokenList(tokens);
            } else {
                setTimeout(check, 100);
            }
        }
        setTimeout(check, 100);
    }, []);

    useEffect(() => {
        console.log('running!');
        console.log(tokenList, baseAddr, quoteAddr);
        if (tokenList && baseAddr && quoteAddr) {
            const findToken = (addr:string) => tokenList.find((tkn: TokenIF) => tkn.address.toLowerCase() === addr.toLowerCase());
            console.log(tokenList);
            console.log(baseAddr, quoteAddr);
            const dataTokenA = findToken(baseAddr);
            const dataTokenB = findToken(quoteAddr);
            console.log(dataTokenA, dataTokenB);
            dataTokenA && setTokenA(dataTokenA);
            dataTokenB && setTokenB(dataTokenB);
        }
    }, [tokenList, baseAddr, quoteAddr]);

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
                        baseAddr +
                        '&tokenB=' +
                        quoteAddr
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
                        <div className={styles.pool_display_container}>
                            <div className={styles.pool_display}>
                                <div>
                                    {tokenA && <img src={tokenA.logoURI} alt='token a' />}
                                    {tokenA && <h3>{tokenA.symbol}</h3>}
                                </div>
                                {tokenA && <p>{tokenA.name}</p>}
                            </div>
                            <div className={styles.pool_display}>
                                <div>
                                    {tokenB && <img src={tokenB.logoURI} alt='token b' />}
                                    {tokenB && <h3>{tokenB.symbol}</h3>}
                                </div>
                                {tokenB && <p>{tokenB.name}</p>}
                            </div>
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
                            <InitPoolExtraInfo />
                        </div>
                        <footer>
                            <Button title='Next' action={() => console.log('completed')} />
                        </footer>
                    </ContentContainer>
                </div>
            </div>
        </main>
    );
}
