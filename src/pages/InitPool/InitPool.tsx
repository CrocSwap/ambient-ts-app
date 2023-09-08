// START: Import React and Dongles
import { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { VscClose } from 'react-icons/vsc';

// START: Import JSX Components
import InitPoolExtraInfo from '../../components/InitPool/InitPoolExtraInfo/InitPoolExtraInfo';
import Button from '../../components/Global/Button/Button';

// START: Import Local Files
import styles from './InitPool.module.css';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
    updateTransactionHash,
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
import { useAccount, useProvider } from 'wagmi';
import { useLinkGen, linkGenMethodsIF } from '../../utils/hooks/useLinkGen';
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import { exponentialNumRegEx } from '../../utils/regex/exports';
import uriToHttp from '../../utils/functions/uriToHttp';
import TokenIcon from '../../components/Global/TokenIcon/TokenIcon';
import { CachedDataContext } from '../../contexts/CachedDataContext';
import { getMainnetEquivalent } from '../../utils/data/testTokenMap';
import { TokenContext } from '../../contexts/TokenContext';
import { useUrlParams } from '../../utils/hooks/useUrlParams';

// react functional component
export default function InitPool() {
    const provider = useProvider();
    const {
        wagmiModal: { open: openWagmiModalWallet },
    } = useContext(AppStateContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
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
    const { tokens } = useContext(TokenContext);
    useUrlParams(['chain', 'tokenA', 'tokenB'], tokens, chainId, provider);

    const dispatch = useAppDispatch();

    const { isConnected } = useAccount();

    // function to programmatically navigate the user
    const navigate = useNavigate();

    // DO NOT combine these hooks with useMemo()
    // the useMemo() hook does NOT respect asynchronicity
    const [poolExists, setPoolExists] = useState<boolean | null>(null);

    const [isApprovalPending, setIsApprovalPending] = useState(false);
    const [isInitPending, setIsInitPending] = useState(false);

    const [initialPriceInBaseDenom, setInitialPriceInBaseDenom] = useState<
        number | undefined
    >();
    const [estimatedInitialPriceInBase, setEstimatedInitialPriceInBase] =
        useState<string>('0');
    const [estimatedInitialPriceDisplay, setEstimatedInitialPriceDisplay] =
        useState<string>('0');
    const [initialPriceForDOM, setInitialPriceForDOM] = useState<string>('');

    const [isDenomBase, setIsDenomBase] = useState(true);

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
    }, [crocEnv, sessionReceipts.length, baseToken, quoteToken]);

    useEffect(() => {
        (async () => {
            const mainnetBase = getMainnetEquivalent(
                baseToken.address,
                chainId,
            );
            const mainnetQuote = getMainnetEquivalent(
                quoteToken.address,
                chainId,
            );
            const basePricePromise = cachedFetchTokenPrice(
                mainnetBase.token,
                mainnetBase.chainId,
            );
            const quotePricePromise = cachedFetchTokenPrice(
                mainnetQuote.token,
                mainnetQuote.chainId,
            );

            const basePrice = (await basePricePromise)?.usdPrice || 2000;
            const quotePrice = (await quotePricePromise)?.usdPrice || 1;

            const defaultPriceNum = basePrice / quotePrice;

            const defaultPriceTruncated =
                defaultPriceNum < 0.0001
                    ? defaultPriceNum.toExponential(2)
                    : defaultPriceNum < 2
                    ? defaultPriceNum.toPrecision(3)
                    : defaultPriceNum.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            setInitialPriceInBaseDenom(defaultPriceNum);
            setInitialPriceForDOM(defaultPriceTruncated);
            setEstimatedInitialPriceInBase(defaultPriceTruncated);
            setEstimatedInitialPriceDisplay(defaultPriceTruncated);
        })();
    }, [baseToken, quoteToken]);

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
            const averageInitCostInGasDrops = 157922;
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageInitCostInGasDrops *
                1e-9 *
                ethMainnetUsdPrice;

            setInitGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

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
                        txType: 'Approve',
                        txDescription: `Approval of ${token.symbol}`,
                    }),
                );
            let receipt;
            try {
                if (tx) receipt = await tx.wait();
            } catch (e) {
                const error = e as TransactionError;
                console.error({ error });
                // The user used 'speed up' or something similar
                // in their client, but we now have the updated info
                if (isTransactionReplacedError(error)) {
                    IS_LOCAL_ENV && console.debug('repriced');
                    dispatch(removePendingTx(error.hash));

                    const newTransactionHash = error.replacement.hash;
                    dispatch(addPendingTx(newTransactionHash));

                    dispatch(
                        updateTransactionHash({
                            oldHash: error.hash,
                            newHash: error.replacement.hash,
                        }),
                    );
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
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const sendInit = () => {
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
                                txType: 'Init',
                                txDescription: `Pool Initialization of ${quoteToken.symbol} / ${baseToken.symbol}`,
                            }),
                        );
                    let receipt;
                    try {
                        if (tx) receipt = await tx.wait();
                    } catch (e) {
                        const error = e as TransactionError;
                        console.error({ error });
                        // The user used 'speed up' or something similar
                        // in their client, but we now have the updated info
                        if (isTransactionReplacedError(error)) {
                            IS_LOCAL_ENV && console.debug('repriced');
                            dispatch(removePendingTx(error.hash));

                            const newTransactionHash = error.replacement.hash;
                            dispatch(addPendingTx(newTransactionHash));

                            //    setNewSwapTransactionHash(newTransactionHash);
                            dispatch(
                                updateTransactionHash({
                                    oldHash: error.hash,
                                    newHash: error.replacement.hash,
                                }),
                            );
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
                        linkGenPool.navigate({
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

    const placeholderText = `e.g. ${estimatedInitialPriceDisplay} (${
        isDenomBase ? baseToken.symbol : quoteToken.symbol
    }/${isDenomBase ? quoteToken.symbol : baseToken.symbol})`;

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isValid =
            event.target.value === '' ||
            event.target.value === '.' ||
            event.target.validity.valid;
        const targetValue = event.target.value.replaceAll(',', '');
        const input = targetValue.startsWith('.')
            ? '0' + targetValue
            : targetValue;
        const targetValueNum = parseFloat(input);

        isValid && setInitialPriceForDOM(input);

        if (
            isValid &&
            ((!isNaN(targetValueNum) && targetValueNum !== 0) ||
                event.target.value === '')
        ) {
            if (event.target.value === '') {
                setInitialPriceInBaseDenom(undefined);
            } else {
                if (isDenomBase) {
                    setInitialPriceInBaseDenom(targetValueNum);
                } else {
                    setInitialPriceInBaseDenom(1 / targetValueNum);
                }
            }
        }
    };

    useEffect(() => {
        handleDisplayUpdate();
    }, [isDenomBase]);

    const handleDisplayUpdate = () => {
        if (estimatedInitialPriceInBase) {
            if (isDenomBase) {
                setEstimatedInitialPriceDisplay(estimatedInitialPriceInBase);
            } else {
                const invertedPriceNum =
                    1 /
                    parseFloat(estimatedInitialPriceInBase.replaceAll(',', ''));

                const invertedPriceTruncated =
                    invertedPriceNum < 0.0001
                        ? invertedPriceNum.toExponential(2)
                        : invertedPriceNum < 2
                        ? invertedPriceNum.toPrecision(3)
                        : invertedPriceNum.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });
                setEstimatedInitialPriceDisplay(invertedPriceTruncated);
            }
        }
        if (initialPriceInBaseDenom) {
            if (!isDenomBase) {
                const newInitialPriceForDOMTruncated =
                    1 / initialPriceInBaseDenom < 0.0001
                        ? (1 / initialPriceInBaseDenom).toExponential(2)
                        : 1 / initialPriceInBaseDenom < 2
                        ? (1 / initialPriceInBaseDenom).toPrecision(3)
                        : (1 / initialPriceInBaseDenom).toLocaleString(
                              undefined,
                              {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              },
                          );
                setInitialPriceForDOM(newInitialPriceForDOMTruncated);
            } else {
                const newInitialPriceForDOMTruncated =
                    initialPriceInBaseDenom < 0.0001
                        ? initialPriceInBaseDenom.toExponential(2)
                        : initialPriceInBaseDenom < 2
                        ? initialPriceInBaseDenom.toPrecision(3)
                        : initialPriceInBaseDenom.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });
                setInitialPriceForDOM(newInitialPriceForDOMTruncated);
            }
        }
    };

    const ButtonToRender = () => {
        let buttonContent;

        switch (true) {
            case poolExists:
                // Display button for an already initialized pool
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
                // Display different buttons based on various conditions
                if (!isTokenAAllowanceSufficient) {
                    // Display token A approval button
                    buttonContent = tokenAApprovalButton;
                } else if (!isTokenBAllowanceSufficient) {
                    // Display token B approval button
                    buttonContent = tokenBApprovalButton;
                } else if (
                    initialPriceInBaseDenom === undefined ||
                    initialPriceInBaseDenom <= 0
                ) {
                    // Display button to enter an initial price
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
                    // Display button for pending initialization
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
                    // Display confirm button for final step
                    buttonContent = (
                        <Button title='Confirm' action={sendInit} flat={true} />
                    );
                }
                break;

            default:
                // Display button to connect wallet if no conditions match
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

    const tokenADisplay = (
        <div className={styles.pool_display}>
            <div>
                <TokenIcon
                    token={tokenA}
                    src={uriToHttp(tokenA.logoURI)}
                    alt={tokenA.symbol}
                    size='2xl'
                />
                {tokenA && <h3>{tokenA.symbol}</h3>}
            </div>
            {tokenA && <p>{tokenA.name}</p>}
        </div>
    );

    const tokenBDisplay = (
        <div className={styles.pool_display}>
            <div>
                <TokenIcon
                    token={tokenB}
                    src={uriToHttp(tokenB.logoURI)}
                    alt={tokenB.symbol}
                    size='2xl'
                />
                {tokenB && <h3>{tokenB.symbol}</h3>}
            </div>
            {tokenB && <p>{tokenB.name}</p>}
        </div>
    );

    const navigateToMarket = (
        <Navigate
            to={linkGenMarket.getFullURL({
                chain: chainId,
                tokenA: baseToken.address,
                tokenB: quoteToken.address,
            })}
            replace={true}
        />
    );

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

    return (
        <section className={styles.main}>
            {poolExists && navigateToMarket}
            <div className={styles.init_pool_container}>
                <div className={styles.top_content}>
                    <header>
                        <p />
                        <h1>Initialize Pool</h1>
                        <VscClose
                            size={25}
                            onClick={() => navigate(-1)}
                            style={{ cursor: 'pointer' }}
                        />
                    </header>
                    <div className={styles.pool_display_container}>
                        {tokenADisplay}
                        {tokenBDisplay}
                        <div className={styles.padding_center}>
                            <div className={styles.pool_price_container}>
                                <span>Initial Price</span>
                                <section style={{ width: '100%' }}>
                                    <input
                                        id='initial-pool-price-quantity'
                                        className={styles.currency_quantity}
                                        placeholder={placeholderText}
                                        type='string'
                                        onChange={handleInputChange}
                                        onBlur={handleDisplayUpdate}
                                        value={initialPriceForDOM}
                                        inputMode='decimal'
                                        autoComplete='off'
                                        autoCorrect='off'
                                        min='0'
                                        minLength={1}
                                        pattern={exponentialNumRegEx.source}
                                    />
                                </section>
                            </div>
                            <InitPoolExtraInfo
                                initialPrice={parseFloat(
                                    initialPriceForDOM.replaceAll(',', ''),
                                )}
                                isDenomBase={isDenomBase}
                                initGasPriceinDollars={initGasPriceinDollars}
                                baseToken={baseToken}
                                quoteToken={quoteToken}
                                setIsDenomBase={setIsDenomBase}
                            />
                        </div>

                        <footer>
                            <ButtonToRender />
                        </footer>
                    </div>
                </div>
            </div>
        </section>
    );
}
