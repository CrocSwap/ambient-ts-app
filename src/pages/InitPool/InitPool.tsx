// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { VscClose } from 'react-icons/vsc';
import { CrocEnv } from '@crocswap-libs/sdk';

// START: Import JSX Components
import InitPoolExtraInfo from '../../components/InitPool/InitPoolExtraInfo/InitPoolExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import Button from '../../components/Global/Button/Button';

// START: Import Local Files
import styles from './InitPool.module.css';
import { useUrlParams } from './useUrlParams';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { TokenPairIF } from '../../utils/interfaces/TokenPairIF';

// interface for props
interface InitPoolPropsIF {
    isUserLoggedIn: boolean;
    crocEnv: CrocEnv | undefined;
    showSidebar: boolean;
    tokenPair: TokenPairIF;
    tokenAAllowance: string;
    setRecheckTokenAApproval: Dispatch<SetStateAction<boolean>>;
    tokenBAllowance: string;
    setRecheckTokenBApproval: Dispatch<SetStateAction<boolean>>;
    openModalWallet: () => void;
}

// react functional component
export default function InitPool(props: InitPoolPropsIF) {
    const {
        openModalWallet,
        isUserLoggedIn,
        crocEnv,
        showSidebar,
        tokenPair,
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
    } = props;

    // URL parameters
    const newPoolData = useUrlParams();

    // data on token pair from RTK
    // may not match params but we'll fix that later with token universe
    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

    // function to programmatically navigate the user
    const navigate = useNavigate();

    // DO NOT combine these hooks with useMemo()
    // the useMemo() hook does NOT respect asynchronicity
    const [poolExists, setPoolExists] = useState<boolean | null>(null);

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
                .then((res) => setPoolExists(res ?? null));
        } else {
            // set value of poolExists as null if there is no crocEnv
            // this is handled as a pre-initialization condition, not a false
            setPoolExists(null);
        }
        // re-run hook if a new crocEnv is created
        // this will happen if the user switches chains
    }, [crocEnv]);

    const [connectButtonDelayElapsed, setConnectButtonDelayElapsed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setConnectButtonDelayElapsed(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const [initialPrice, setInitialPrice] = useState(0);

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) > 0;
    const isTokenBAllowanceSufficient = parseFloat(tokenBAllowance) > 0;

    const loginButton = <Button title='Login' action={openModalWallet} />;

    const approve = async (tokenAddress: string) => {
        if (!crocEnv) return;
        setIsApprovalPending(true);
        try {
            const tx = await crocEnv.token(tokenAddress).approve();
            if (tx) {
                await tx.wait();
            }
        } catch (error) {
            console.log({ error });
        } finally {
            setIsApprovalPending(false);
            setRecheckTokenAApproval(true);
            setRecheckTokenBApproval(true);
        }
    };

    const sendInit = () => {
        console.log(`Initializing ${tokenPair.dataTokenA.symbol}-${tokenPair.dataTokenB.symbol} pool at 
        an initial price of ${initialPrice}`);
        (async () => {
            await crocEnv
                ?.pool(tokenPair.dataTokenA.address, tokenPair.dataTokenB.address)
                .initPool(initialPrice);
        })();
    };

    const tokenAApprovalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Click to Approve ${tokenPair.dataTokenA.symbol}`
                    : `${tokenPair.dataTokenA.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenPair.dataTokenA.address);
            }}
        />
    );

    const tokenBApprovalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Click to Approve ${tokenPair.dataTokenB.symbol}`
                    : `${tokenPair.dataTokenB.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenPair.dataTokenB.address);
            }}
        />
    );

    return (
        <main
            className={styles.main}
            style={{ justifyContent: showSidebar ? 'flex-start' : 'center' }}
        >
            {poolExists && (
                <Navigate
                    to={
                        '/trade/market/chain=0x5&tokenA=' +
                        newPoolData.baseAddr +
                        '&tokenB=' +
                        newPoolData.quoteAddr
                    }
                    replace={true}
                />
            )}
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
                            <div className={styles.pool_price_container}>
                                <span>Initial Price</span>
                                <section>
                                    <input
                                        id={'initial-pool-price-quantity'}
                                        className={styles.currency_quantity}
                                        placeholder={`e.g. 1500 (${tokenPair.dataTokenA.symbol}/${tokenPair.dataTokenB.symbol})`}
                                        type='string'
                                        onChange={(event) => {
                                            setInitialPrice(
                                                parseFloat(event.target.value) > 0
                                                    ? parseFloat(event.target.value)
                                                    : 0,
                                            );
                                        }}
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
                            <InitPoolExtraInfo initialPrice={initialPrice} tokenPair={tokenPair} />
                        </div>
                        <footer>
                            {poolExists ? (
                                <Button
                                    title='Pool Already Initialized'
                                    disabled={true}
                                    action={() => console.log('clicked')}
                                />
                            ) : isUserLoggedIn || !connectButtonDelayElapsed ? (
                                !isTokenAAllowanceSufficient ? (
                                    tokenAApprovalButton
                                ) : !isTokenBAllowanceSufficient ? (
                                    tokenBApprovalButton
                                ) : (
                                    <Button title='Open Confirmation' action={sendInit} />
                                )
                            ) : (
                                loginButton
                            )}
                        </footer>
                    </ContentContainer>
                </div>
            </div>
        </main>
    );
}
