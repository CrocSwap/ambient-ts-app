// START: Import React and Dongles
import { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { VscClose } from 'react-icons/vsc';

// START: Import JSX Components
import InitPoolExtraInfo from '../../components/InitPool/InitPoolExtraInfo/InitPoolExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import Button from '../../components/Global/Button/Button';

// START: Import Local Files
import styles from './InitPool.module.css';
import NoTokenIcon from '../../components/Global/NoTokenIcon/NoTokenIcon';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
} from '../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import { IS_LOCAL_ENV } from '../../constants';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { AppStateContext } from '../../contexts/AppStateContext';
import { TradeTokenContext } from '../../contexts/TradeTokenContext';
import { useAccount } from 'wagmi';
import { useLinkGen, linkGenMethodsIF } from '../../utils/hooks/useLinkGen';
import { Input } from '@material-ui/core';

// react functional component
export default function InitPool() {
    const {
        wagmiModal: { open: openWagmiModalWallet },
    } = useContext(AppStateContext);
    const {
        crocEnv,
        ethMainnetUsdPrice,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const {
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
    } = useContext(TradeTokenContext);

    const dispatch = useAppDispatch();

    const { isConnected } = useAccount();

    // function to programmatically navigate the user
    const navigate = useNavigate();

    // DO NOT combine these hooks with useMemo()
    // the useMemo() hook does NOT respect asynchronicity
    const [poolExists, setPoolExists] = useState<boolean | null>(null);

    const { tokenA, tokenB, baseToken, quoteToken } = useAppSelector(
        (state) => state.tradeData,
    );
    const { sessionReceipts } = useAppSelector((state) => state.receiptData);

    useEffect(() => {
        // make sure crocEnv exists (needs a moment to spin up)
        if (crocEnv) {
            // check if pool exists for token addresses from URL params
            const doesPoolExist = crocEnv
                .pool(baseToken.address, quoteToken.address)
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
    }, [crocEnv, sessionReceipts.length]);

    const [connectButtonDelayElapsed, setConnectButtonDelayElapsed] =
        useState(false);
    const [initGasPriceinDollars, setInitGasPriceinDollars] = useState<
        string | undefined
    >();

    useEffect(() => {
        const timer = setTimeout(() => {
            setConnectButtonDelayElapsed(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // calculate price of gas for pool init
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei * 157922 * 1e-9 * ethMainnetUsdPrice;

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

    const defaultInitialPrice = 2000;

    const [placeHolderPrice, setPlaceholderPrice] =
        useState<number>(defaultInitialPrice);

    const [valueDisplayString, setValueDisplayString] = useState<string>('');

    const [isDenomBase, setIsDenomBase] = useState(true);

    const invertInitialPrice = () => {
        if (initialPrice) setInitialPrice(1 / initialPrice);
        setPlaceholderPrice(1 / placeHolderPrice);
    };

    useEffect(() => {
        if (initialPrice !== undefined) {
            setValueDisplayString(initialPrice.toString() || '');
        }
    }, [initialPrice]);

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

    const approve = async (token: TokenIF) => {
        if (!crocEnv) return;
        try {
            setIsApprovalPending(true);
            const tx = await crocEnv.token(token.address).approve();
            if (tx) dispatch(addPendingTx(tx?.hash));
            if (tx?.hash)
                dispatch(
                    addTransactionByType({
                        txHash: tx.hash,
                        txType: `Approval of ${token.symbol}`,
                    }),
                );
            let receipt;
            try {
                if (tx) receipt = await tx.wait();
            } catch (e) {
                const error = e as TransactionError;
                console.error({ error });
                // The user used "speed up" or something similar
                // in their client, but we now have the updated info
                if (isTransactionReplacedError(error)) {
                    IS_LOCAL_ENV && console.debug('repriced');
                    dispatch(removePendingTx(error.hash));

                    const newTransactionHash = error.replacement.hash;
                    dispatch(addPendingTx(newTransactionHash));

                    IS_LOCAL_ENV && console.debug({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    console.error({ error });
                    receipt = error.receipt;
                }
            }
            if (receipt) {
                dispatch(addReceipt(JSON.stringify(receipt)));
                dispatch(removePendingTx(receipt.transactionHash));
            }
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
        } finally {
            setIsApprovalPending(false);
            setRecheckTokenAApproval(true);
            setRecheckTokenBApproval(true);
        }
    };

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenRange: linkGenMethodsIF = useLinkGen('range');

    const sendInit = () => {
        IS_LOCAL_ENV &&
            console.debug(`Initializing ${baseToken.symbol}-${quoteToken.symbol} pool at
        an initial price of ${initialPriceInBaseDenom}`);
        if (initialPriceInBaseDenom) {
            (async () => {
                let tx;
                try {
                    setIsInitPending(true);
                    tx = await crocEnv
                        ?.pool(baseToken.address, quoteToken.address)
                        .initPool(initialPriceInBaseDenom);

                    if (tx) dispatch(addPendingTx(tx?.hash));
                    if (tx?.hash)
                        dispatch(
                            addTransactionByType({
                                txHash: tx.hash,
                                txType: `Pool Initialization of ${quoteToken.symbol} / ${baseToken.symbol}`,
                            }),
                        );
                    let receipt;
                    try {
                        if (tx) receipt = await tx.wait();
                    } catch (e) {
                        const error = e as TransactionError;
                        console.error({ error });
                        // The user used "speed up" or something similar
                        // in their client, but we now have the updated info
                        if (isTransactionReplacedError(error)) {
                            IS_LOCAL_ENV && console.debug('repriced');
                            dispatch(removePendingTx(error.hash));

                            const newTransactionHash = error.replacement.hash;
                            dispatch(addPendingTx(newTransactionHash));

                            //    setNewSwapTransactionHash(newTransactionHash);
                            IS_LOCAL_ENV &&
                                console.debug({ newTransactionHash });
                            receipt = error.receipt;
                        } else if (isTransactionFailedError(error)) {
                            receipt = error.receipt;
                        }
                    }
                    if (receipt) {
                        dispatch(addReceipt(JSON.stringify(receipt)));
                        dispatch(removePendingTx(receipt.transactionHash));
                        linkGenRange.navigate({
                            chain: chainId,
                            tokenA: baseToken.address,
                            tokenB: quoteToken.address,
                        });
                    }
                } catch (error) {
                    if (
                        error.reason ===
                        'sending a transaction requires a signer'
                    ) {
                        location.reload();
                    }
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
                    ? `Approve ${tokenA.symbol}`
                    : `${tokenA.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenA);
            }}
            flat={true}
        />
    );

    const tokenBApprovalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Approve ${tokenB.symbol}`
                    : `${tokenB.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenB);
            }}
            flat={true}
        />
    );

    const placeholderText = `e.g. ${placeHolderPrice} (${
        isDenomBase ? baseToken.symbol : quoteToken.symbol
    }/${isDenomBase ? quoteToken.symbol : baseToken.symbol})`;

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isValid =
            event.target.value === '' || event.target.validity.valid;
        const targetValue = event.target.value.replaceAll(',', '');
        const input = targetValue.startsWith('.')
            ? '0' + targetValue
            : targetValue;
        const targetValueNum = parseFloat(input);

        isValid && setValueDisplayString(input);

        if (
            isValid &&
            ((!isNaN(targetValueNum) && targetValueNum !== 0) ||
                event.target.value === '')
        ) {
            if (event.target.value === '') {
                setInitialPrice(undefined);
            } else {
                setInitialPrice(targetValueNum);
            }
        }
    };

    const initialPriceInput = (
        <input
            id='initial-pool-price-quantity'
            className={styles.currency_quantity}
            placeholder={placeholderText}
            type='string'
            onChange={handleInputChange}
            value={valueDisplayString}
            inputMode='decimal'
            autoComplete='off'
            autoCorrect='off'
            min='0'
            minLength={1}
            pattern='^[0-9,]*[.]?[0-9]*$'
        />
    );

    const ButtonToRender = () => {
        let buttonContent;

        switch (true) {
            case poolExists:
                buttonContent = (
                    <Button
                        title='Pool Already Initialized'
                        disabled={true}
                        action={() => {
                            IS_LOCAL_ENV && console.debug('clicked');
                        }}
                        flat={true}
                    />
                );
                break;

            case isConnected || !connectButtonDelayElapsed:
                if (!isTokenAAllowanceSufficient) {
                    buttonContent = tokenAApprovalButton;
                } else if (!isTokenBAllowanceSufficient) {
                    buttonContent = tokenBApprovalButton;
                } else if (initialPrice === undefined || initialPrice <= 0) {
                    buttonContent = (
                        <Button
                            title='Enter an Initial Price'
                            disabled={true}
                            action={() => {
                                IS_LOCAL_ENV && console.debug('clicked');
                            }}
                            flat={true}
                        />
                    );
                } else if (isInitPending === true) {
                    buttonContent = (
                        <Button
                            title='Initialization Pending'
                            disabled={true}
                            action={() => {
                                IS_LOCAL_ENV && console.debug('clicked');
                            }}
                            flat={true}
                        />
                    );
                } else {
                    buttonContent = (
                        <Button title='Confirm' action={sendInit} flat={true} />
                    );
                }
                break;

            default:
                buttonContent = (
                    <Button
                        title='Connect Wallet'
                        action={openWagmiModalWallet}
                        flat={true}
                    />
                );
                break;
        }

        return buttonContent;
    };

    return (
        <section className={styles.main}>
            {poolExists && (
                <Navigate
                    to={linkGenMarket.getFullURL({
                        chain: chainId,
                        tokenA: baseToken.address,
                        tokenB: quoteToken.address,
                    })}
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
                                            <img
                                                src={tokenA.logoURI}
                                                alt={tokenA.symbol}
                                            />
                                        ) : (
                                            <NoTokenIcon
                                                tokenInitial={tokenA.symbol.charAt(
                                                    0,
                                                )}
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
                                            <img
                                                src={tokenB.logoURI}
                                                alt={tokenB.symbol}
                                            />
                                        ) : (
                                            <NoTokenIcon
                                                tokenInitial={tokenB.symbol.charAt(
                                                    0,
                                                )}
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
                                        {initialPriceInput}
                                    </section>
                                </div>
                                <InitPoolExtraInfo
                                    initialPrice={initialPrice}
                                    isDenomBase={isDenomBase}
                                    initGasPriceinDollars={
                                        initGasPriceinDollars
                                    }
                                    baseToken={baseToken}
                                    quoteToken={quoteToken}
                                    setIsDenomBase={setIsDenomBase}
                                    invertInitialPrice={invertInitialPrice}
                                />
                            </div>

                            <footer>
                                <ButtonToRender />
                            </footer>
                        </div>
                    </ContentContainer>
                </div>
            </div>
        </section>
    );
}
