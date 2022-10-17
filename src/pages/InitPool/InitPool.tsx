// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { VscClose } from 'react-icons/vsc';
import { CrocEnv } from '@crocswap-libs/sdk';
import { useMoralisWeb3Api } from 'react-moralis';

// START: Import JSX Components
import InitPoolExtraInfo from '../../components/InitPool/InitPoolExtraInfo/InitPoolExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import Button from '../../components/Global/Button/Button';

// START: Import Local Files
import styles from './InitPool.module.css';
import { useUrlParams } from './useUrlParams';
import { TokenPairIF } from '../../utils/interfaces/TokenPairIF';
import NoTokenIcon from '../../components/Global/NoTokenIcon/NoTokenIcon';
import { TokenIF, TokenListIF } from '../../utils/interfaces/exports';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../utils/state/tradeDataSlice';

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
    ethMainnetUsdPrice?: number;
    gasPriceInGwei: number | undefined;
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
        ethMainnetUsdPrice,
        gasPriceInGwei,
    } = props;

    const dispatch = useAppDispatch();

    // URL parameters
    const { chain, baseAddr, quoteAddr } = useUrlParams();

    // function to programmatically navigate the user
    const navigate = useNavigate();

    const Web3Api = useMoralisWeb3Api();

    // DO NOT combine these hooks with useMemo()
    // the useMemo() hook does NOT respect asynchronicity
    const [poolExists, setPoolExists] = useState<boolean | null>(null);

    useEffect(() => {
        // make sure crocEnv exists (needs a moment to spin up)
        if (crocEnv) {
            // check if pool exists for token addresses from URL params
            const doesPoolExist = crocEnv.pool(baseAddr as string, quoteAddr as string).isInit();
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

    const [tokenList, setTokenList] = useState<TokenIF[] | null>(null);
    const [tokenALocal, setTokenALocal] = useState<TokenIF | null | undefined>(null);
    useEffect(() => console.log(tokenALocal), [tokenALocal]);
    const [tokenBLocal, setTokenBLocal] = useState<TokenIF | null | undefined>(null);
    useEffect(() => console.log(tokenBLocal), [tokenBLocal]);
    useEffect(() => {
        tokenALocal && dispatch(setTokenA(tokenALocal));
        tokenBLocal && dispatch(setTokenB(tokenBLocal));
    }, [tokenALocal, tokenBLocal]);

    useEffect(() => {
        // get allTokenLists from local storage
        function check() {
            const tokenListsFromStorage = localStorage.getItem('allTokenLists');
            if (tokenListsFromStorage !== null) {
                const tokenLists = JSON.parse(tokenListsFromStorage as string);
                const ambientList = tokenLists.find(
                    (list: TokenListIF) => list.name === 'Ambient Token List',
                );
                const tokens = ambientList.tokens;
                console.log(tokens);
                setTokenList(tokens);
            } else {
                setTimeout(check, 100);
            }
        }
        setTimeout(check, 100);
    }, []);

    useEffect(() => {
        console.log(tokenList, baseAddr, quoteAddr);
        if (tokenList && baseAddr && quoteAddr) {
            console.log('running!');
            const findToken = (addr: string) =>
                tokenList.find((tkn: TokenIF) => tkn.address.toLowerCase() === addr.toLowerCase());

            console.log(tokenList);
            console.log(baseAddr, quoteAddr);
            const dataTokenA = findToken(baseAddr);
            const dataTokenB = findToken(quoteAddr);
            console.log(dataTokenA, dataTokenB);
            setTokenALocal(dataTokenA);
            setTokenBLocal(dataTokenB);
        }
    }, [tokenList, baseAddr, quoteAddr]);

    useEffect(() => {
        // TODO: find a way to correctly type this return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function setTokenFromChain(addr: string, target: string): any {
            const setTarget = (data: TokenIF, whichToken: string) => {
                switch (whichToken) {
                    case 'tokenALocal':
                        setTokenALocal(data);
                        break;
                    case 'tokenBLocal':
                        setTokenBLocal(data);
                        break;
                }
            };
            const promise = Web3Api.token.getTokenMetadata({
                chain: chain as '0x5',
                addresses: [addr],
            });
            Promise.resolve(promise)
                .then((res) => res[0])
                .then((res) => ({
                    name: res.name,
                    chainId: parseInt(chain as string),
                    address: res.address,
                    symbol: res.symbol,
                    decimals: parseInt(res.decimals),
                    logoURI: res.logo ?? '',
                    fromList: 'urlParam',
                }))
                .then((res) => setTarget(res, target));
        }
        tokenALocal === undefined && setTokenFromChain(baseAddr, 'tokenALocal');
        tokenBLocal === undefined && setTokenFromChain(quoteAddr, 'tokenBLocal');
    }, [tokenALocal, tokenBLocal]);

    const [connectButtonDelayElapsed, setConnectButtonDelayElapsed] = useState(false);
    const [initGasPriceinDollars, setInitGasPriceinDollars] = useState<string | undefined>();

    useEffect(() => {
        const timer = setTimeout(() => {
            setConnectButtonDelayElapsed(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // calculate price of gas for swap
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum = gasPriceInGwei * 157922 * 1e-9 * ethMainnetUsdPrice;

            setInitGasPriceinDollars(
                '~$' +
                    gasPriceInDollarsNum.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const [initialPrice, setInitialPrice] = useState(0);

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) > 0;
    const isTokenBAllowanceSufficient = parseFloat(tokenBAllowance) > 0;

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

    const {tokenA, tokenB} = useAppSelector((state) => state.tradeData);

    return (
        <main
            className={styles.main}
            style={{ justifyContent: showSidebar ? 'flex-start' : 'center' }}
        >
            {poolExists && (
                <Navigate
                    to={'/trade/market/chain=0x5&tokenA=' + baseAddr + '&tokenB=' + quoteAddr}
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
                                    {/* <img src={tokenA.logoURI} alt='token a' /> */}
                                    {tokenA &&
                                        (tokenA.logoURI ? (
                                            <img src={tokenA.logoURI} alt={tokenA.symbol} />
                                        ) : (
                                            <NoTokenIcon
                                                tokenInitial={tokenA.symbol.charAt(0)}
                                                width='30px'
                                            />
                                        ))}
                                    {tokenA && <h3>{tokenA.symbol}</h3>}
                                </div>
                                {tokenA && <p>{tokenA.name}</p>}
                            </div>
                            <div className={styles.pool_display}>
                                <div>
                                    {tokenB &&
                                        (tokenB.logoURI ? (
                                            <img src={tokenB.logoURI} alt={tokenB.symbol} />
                                        ) : (
                                            <NoTokenIcon
                                                tokenInitial={tokenB.symbol.charAt(0)}
                                                width='30px'
                                            />
                                        ))}
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
                            <InitPoolExtraInfo
                                initialPrice={initialPrice}
                                initGasPriceinDollars={initGasPriceinDollars}
                                tokenPair={tokenPair}
                            />
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
                                <Button title='Login' action={openModalWallet} />
                            )}
                        </footer>
                    </ContentContainer>
                </div>
            </div>
        </main>
    );
}
