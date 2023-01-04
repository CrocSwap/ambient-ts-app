// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { VscClose } from 'react-icons/vsc';
import { CrocEnv } from '@crocswap-libs/sdk';
import Moralis from 'moralis';
// import { EvmChain } from '@moralisweb3/common-evm-utils';

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
import { addPendingTx, addReceipt, removePendingTx } from '../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import InitPoolDenom from '../../components/InitPool/InitPoolDenom/InitPoolDenom';

// interface for props
interface InitPoolPropsIF {
    isUserLoggedIn: boolean | undefined;
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
    // useEffect(() => console.log(tokenALocal), [tokenALocal]);
    const [tokenBLocal, setTokenBLocal] = useState<TokenIF | null | undefined>(null);
    // useEffect(() => console.log(tokenBLocal), [tokenBLocal]);
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
                // console.log(tokens);
                setTokenList(tokens);
            } else {
                setTimeout(check, 100);
            }
        }
        setTimeout(check, 100);
    }, []);

    useEffect(() => {
        // console.log(tokenList, baseAddr, quoteAddr);
        if (tokenList && baseAddr && quoteAddr) {
            // console.log('running!');
            const findToken = (addr: string) =>
                tokenList.find((tkn: TokenIF) => tkn.address.toLowerCase() === addr.toLowerCase());

            // console.log(tokenList);
            // console.log(baseAddr, quoteAddr);
            const dataTokenA = findToken(baseAddr);
            const dataTokenB = findToken(quoteAddr);
            // console.log(dataTokenA, dataTokenB);
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
            const promise = Moralis.EvmApi.token.getTokenMetadata({
                addresses: [addr],
                chain,
            });
            // const promise = Moralis.Web3API.token.getTokenMetadata({
            //     chain: chain as '0x5',
            //     addresses: [addr],
            // });

            Promise.resolve(promise)
                .then((res) => res?.result[0].token)
                .then((token) => {
                    // console.log({ token });
                    return {
                        name: token.name,
                        chainId: token.chain.decimal,
                        address: token.contractAddress.lowercase,
                        symbol: token.symbol,
                        decimals: token.decimals,
                        logoURI: token.logo ?? '',
                        fromList: 'urlParam',
                    };
                })
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

    // calculate price of gas for pool init
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum = gasPriceInGwei * 157922 * 1e-9 * ethMainnetUsdPrice;

            setInitGasPriceinDollars(
                '$' +
                    gasPriceInDollarsNum.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const [isApprovalPending, setIsApprovalPending] = useState(false);
    const [isInitPending, setIsInitPending] = useState(false);

    const [initialPrice, setInitialPrice] = useState<number | undefined>();
    const [initialPriceInBaseDenom, setInitialPriceInBaseDenom] = useState(0);

    const { tokenA, tokenB, baseToken, quoteToken } = useAppSelector((state) => state.tradeData);

    const [isDenomBase, setIsDenomBase] = useState(true);

    const invertInitialPrice = () => {
        if (initialPrice) setInitialPrice(1 / initialPrice);
    };

    useEffect(() => {
        if (initialPrice) {
            if (isDenomBase) {
                setInitialPriceInBaseDenom(initialPrice);
            } else {
                setInitialPriceInBaseDenom(1 / initialPrice);
            }
        }
    }, [isDenomBase, initialPrice]);

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) > 0;
    const isTokenBAllowanceSufficient = parseFloat(tokenBAllowance) > 0;

    const approve = async (tokenAddress: string) => {
        if (!crocEnv) return;
        try {
            setIsApprovalPending(true);
            const tx = await crocEnv.token(tokenAddress).approve();
            if (tx) dispatch(addPendingTx(tx?.hash));
            let receipt;
            try {
                if (tx) receipt = await tx.wait();
            } catch (e) {
                const error = e as TransactionError;
                console.log({ error });
                // The user used "speed up" or something similar
                // in their client, but we now have the updated info
                if (isTransactionReplacedError(error)) {
                    console.log('repriced');
                    dispatch(removePendingTx(error.hash));

                    const newTransactionHash = error.replacement.hash;
                    dispatch(addPendingTx(newTransactionHash));

                    console.log({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    // console.log({ error });
                    receipt = error.receipt;
                }
            }
            if (receipt) {
                dispatch(addReceipt(JSON.stringify(receipt)));
                dispatch(removePendingTx(receipt.transactionHash));
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
        an initial price of ${initialPriceInBaseDenom}`);
        if (initialPriceInBaseDenom) {
            (async () => {
                let tx;
                try {
                    setIsInitPending(true);
                    tx = await crocEnv
                        ?.pool(tokenPair.dataTokenA.address, tokenPair.dataTokenB.address)
                        .initPool(initialPriceInBaseDenom);

                    if (tx) dispatch(addPendingTx(tx?.hash));

                    let receipt;
                    try {
                        if (tx) receipt = await tx.wait();
                    } catch (e) {
                        const error = e as TransactionError;
                        console.log({ error });
                        // The user used "speed up" or something similar
                        // in their client, but we now have the updated info
                        if (isTransactionReplacedError(error)) {
                            console.log('repriced');
                            dispatch(removePendingTx(error.hash));

                            const newTransactionHash = error.replacement.hash;
                            dispatch(addPendingTx(newTransactionHash));

                            //    setNewSwapTransactionHash(newTransactionHash);
                            console.log({ newTransactionHash });
                            receipt = error.receipt;
                        } else if (isTransactionFailedError(error)) {
                            receipt = error.receipt;
                        }
                    }
                    if (receipt) {
                        dispatch(addReceipt(JSON.stringify(receipt)));
                        dispatch(removePendingTx(receipt.transactionHash));
                        navigate(
                            '/trade/range/chain=0x5&tokenA=' + baseAddr + '&tokenB=' + quoteAddr,
                            {
                                replace: true,
                            },
                        );
                    }
                } catch (error) {
                    console.error({ error });
                } finally {
                    setIsInitPending(false);
                }
            })();
        }
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
            flat={true}
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
            flat={true}
        />
    );

    return (
        <section className={styles.main}>
            {poolExists && (
                <Navigate
                    to={'/trade/market/chain=0x5&tokenA=' + baseAddr + '&tokenB=' + quoteAddr}
                    replace={true}
                />
            )}
            <div className={styles.init_pool_container}>
                <div className={styles.back_button}>
                    <VscClose size={30} onClick={() => navigate(-1)} />
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
                            <div className={styles.padding_center}>
                                <div className={styles.pool_price_container}>
                                    <span>Initial Price</span>
                                    <section style={{ width: '100%%' }}>
                                        <input
                                            id={'initial-pool-price-quantity'}
                                            className={styles.currency_quantity}
                                            placeholder={`e.g. 1500 (${baseToken.symbol}/${quoteToken.symbol})`}
                                            type='string'
                                            onChange={(event) => {
                                                if (parseFloat(event.target.value) > 0) {
                                                    setInitialPrice(parseFloat(event.target.value));
                                                } else if (event.target.value === '') {
                                                    setInitialPrice(undefined);
                                                }
                                            }}
                                            value={initialPrice}
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
                                    isDenomBase={isDenomBase}
                                    initGasPriceinDollars={initGasPriceinDollars}
                                    baseToken={baseToken}
                                    quoteToken={quoteToken}
                                />
                            </div>
                            <InitPoolDenom
                                isDenomBase={isDenomBase}
                                setIsDenomBase={setIsDenomBase}
                                invertInitialPrice={invertInitialPrice}
                            />
                            <footer>
                                {poolExists ? (
                                    <Button
                                        title='Pool Already Initialized'
                                        disabled={true}
                                        action={() => console.log('clicked')}
                                        flat={true}
                                    />
                                ) : isUserLoggedIn || !connectButtonDelayElapsed ? (
                                    !isTokenAAllowanceSufficient ? (
                                        tokenAApprovalButton
                                    ) : !isTokenBAllowanceSufficient ? (
                                        tokenBApprovalButton
                                    ) : initialPrice === undefined || initialPrice <= 0 ? (
                                        <Button
                                            title='Enter an Initial Price'
                                            disabled={true}
                                            action={() => console.log('clicked')}
                                            flat={true}
                                        />
                                    ) : isInitPending === true ? (
                                        <Button
                                            title='Initialization Pending'
                                            disabled={true}
                                            action={() => console.log('clicked')}
                                            flat={true}
                                        />
                                    ) : (
                                        <Button
                                            title='Open Confirmation'
                                            action={sendInit}
                                            flat={true}
                                        />
                                    )
                                ) : (
                                    <Button title='Login' action={openModalWallet} flat={true} />
                                )}
                            </footer>
                        </div>
                    </ContentContainer>
                </div>
            </div>
        </section>
    );
}
