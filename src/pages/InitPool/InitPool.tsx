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
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import { exponentialNumRegEx } from '../../utils/regex/exports';
import uriToHttp from '../../utils/functions/uriToHttp';
import TokenIcon from '../../components/Global/TokenIcon/TokenIcon';
import { CachedDataContext } from '../../contexts/CachedDataContext';
import { getMainnetEquivalent } from '../../utils/data/testTokenMap';
import LocalTokenSelect from '../../components/Global/LocalTokenSelect/LocalTokenSelect';
import { LocalPairDataIF } from '../../utils/state/localPairDataSlice';
import TokenInputQuantity from '../../components/Global/TokenInput/TokenInputQuantity';
import RangeWidth from '../../components/Trade/Range/RangeWidth/RangeWidth';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { PoolContext } from '../../contexts/PoolContext';
import RangePriceInfo from '../../components/Trade/Range/RangePriceInfo/RangePriceInfo';
import RangeBounds from '../../components/Global/RangeBounds/RangeBounds';
import ButtonSwitch from '../../components/Global/Toggle/ButtonSwitch';
import { toggleAdvancedMode } from '../../utils/state/tradeDataSlice';
import { LuEdit2 } from 'react-icons/lu';
import { FiRefreshCw } from 'react-icons/fi';
import { FlexContainer } from '../../components/Global/Analytics/Analytics.styles';

// react functional component
export default function InitPool() {
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
    const { poolPriceDisplay } = useContext(PoolContext);

    const {
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
    } = useContext(TradeTokenContext);

    const dispatch = useAppDispatch();
    const handleToggle = () => dispatch(toggleAdvancedMode());
    const {
        tradeData: { advancedMode },
    } = useAppSelector((state) => state);

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

    // const { tokenA, tokenB, baseToken, quoteToken } = useAppSelector(
    //     (state) => state.tradeData,
    // );
    const localPair: LocalPairDataIF = useAppSelector(
        (state) => state.localPairData,
    );
    const [tokenA, tokenB] = localPair.tokens;
    const baseToken = tokenA;
    const quoteToken = tokenB;
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
            const gasPriceInDollarsNum =
                gasPriceInGwei * 157922 * 1e-9 * ethMainnetUsdPrice;

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
                        txType: `Approval of ${token.symbol}`,
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
                                txType: `Pool Initialization of ${quoteToken.symbol} / ${baseToken.symbol}`,
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

    // Newwwwww
    const [tokenModalOpen, setTokenModalOpen] = useState(false);

    // See Range.tsx line 81
    const [rangeWidthPercentage, setRangeWidthPercentage] =
        useState<number>(23);
    const [
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
    ] = useState(false);
    // const tokenA = localPair.tokens[0]
    // const tokenB = localPair.tokens[1]

    const [pinnedDisplayPrices, setPinnedDisplayPrices] = useState<
        | {
              pinnedMinPriceDisplay: string;
              pinnedMaxPriceDisplay: string;
              pinnedMinPriceDisplayTruncated: string;
              pinnedMaxPriceDisplayTruncated: string;
              pinnedMinPriceDisplayTruncatedWithCommas: string;
              pinnedMaxPriceDisplayTruncatedWithCommas: string;
              pinnedLowTick: number;
              pinnedHighTick: number;
              pinnedMinPriceNonDisplay: number;
              pinnedMaxPriceNonDisplay: number;
          }
        | undefined
    >();
    const [isAmbient, setIsAmbient] = useState(false);

    const [pinnedMinPriceDisplayTruncated, setPinnedMinPriceDisplayTruncated] =
        useState('');
    const [pinnedMaxPriceDisplayTruncated, setPinnedMaxPriceDisplayTruncated] =
        useState('');
    const minPriceDisplay = isAmbient ? '0' : pinnedMinPriceDisplayTruncated;
    const maxPriceDisplay = isAmbient
        ? 'Infinity'
        : pinnedMaxPriceDisplayTruncated;

    const isTokenABase = false;

    const displayPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : poolPriceDisplay ?? 0;
    const poolPriceCharacter = isDenomBase
        ? isTokenABase
            ? getUnicodeCharacter(tokenB.symbol)
            : getUnicodeCharacter(tokenA.symbol)
        : !isTokenABase
        ? getUnicodeCharacter(tokenB.symbol)
        : getUnicodeCharacter(tokenA.symbol);

    // Min Max Price
    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');
    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] =
        useState(-10);
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] =
        useState(10);
    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] =
        useState(false);
    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] =
        useState(false);
    const [minPrice, setMinPrice] = useState(10);
    const [maxPrice, setMaxPrice] = useState(100);

    const rangeWidthProps = {
        rangeWidthPercentage: rangeWidthPercentage,
        setRangeWidthPercentage: setRangeWidthPercentage,
        setRescaleRangeBoundariesWithSlider:
            setRescaleRangeBoundariesWithSlider,
        inputId: 'init_pool_slider',
    };

    const rangePriceInfoProps = {
        pinnedDisplayPrices: pinnedDisplayPrices,
        spotPriceDisplay: getFormattedNumber({
            value: displayPriceWithDenom,
        }),
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        aprPercentage: 10,
        daysInRange: 10,
        isTokenABase: false,
        poolPriceCharacter: poolPriceCharacter,
        isAmbient: isAmbient,
    };

    const minMaxPriceProps = {
        minPricePercentage: minPriceDifferencePercentage,
        maxPricePercentage: maxPriceDifferencePercentage,
        minPriceInputString: minPriceInputString,
        maxPriceInputString: maxPriceInputString,
        setMinPriceInputString: setMinPriceInputString,
        setMaxPriceInputString: setMaxPriceInputString,
        isDenomBase: isDenomBase,
        highBoundOnBlur: () => setRangeHighBoundFieldBlurred(true),
        lowBoundOnBlur: () => setRangeLowBoundFieldBlurred(true),
        rangeLowTick: 0,
        rangeHighTick: 10,
        disable: false,
        maxPrice: maxPrice,
        minPrice: minPrice,
        setMaxPrice: setMaxPrice,
        setMinPrice: setMinPrice,
    };

    const simpleTokenSelect = (
        <div className={styles.local_token_container}>
            <p className={styles.label_title}>Select Tokens</p>
            <LocalTokenSelect
                tokenAorB={'A'}
                token={tokenA}
                setTokenModalOpen={setTokenModalOpen}
            />
            <LocalTokenSelect
                tokenAorB={'B'}
                token={tokenB}
                setTokenModalOpen={setTokenModalOpen}
            />
        </div>
    );

    const initPriceContainer = (
        <div
            className={`${styles.pool_price_container} ${
                poolExists === true && styles.content_disabled
            }`}
        >
            <p className={styles.label_title}>Initial Price</p>
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
    );

    const collateralContent = (
        <div
            className={`${styles.collateral_container} ${
                poolExists === true && styles.content_disabled
            }`}
        >
            <div>
                <p className={styles.label_title}>Collateral</p>
                <FlexContainer>
                    <LuEdit2 />
                    <FiRefreshCw />
                </FlexContainer>
            </div>

            <TokenInputQuantity
                tokenAorB={'A'}
                value={'0'}
                handleTokenInputEvent={() => console.log('yes')}
                disable={false}
                token={tokenA}
                setTokenModalOpen={setTokenModalOpen}
                fieldId='select'
                onInitPage
            />
            <TokenInputQuantity
                tokenAorB={'A'}
                value={'0'}
                handleTokenInputEvent={() => console.log('yes')}
                disable={false}
                token={tokenB}
                setTokenModalOpen={setTokenModalOpen}
                fieldId='select'
                onInitPage
            />
        </div>
    );

    const newContent = (
        <section className={styles.main}>
            <div className={styles.outer_container}>
                <div className={styles.gradient_container}>
                    <div className={styles.main_container}>
                        <header>
                            <p />
                            Initialize Pool
                            <p />
                        </header>

                        <div className={styles.inner_container}>
                            <div className={styles.left_container}>
                                {simpleTokenSelect}
                                {initPriceContainer}
                                {collateralContent}
                            </div>

                            <div className={styles.right_container}>
                                <p className={styles.label_title}>
                                    Initial Range
                                </p>

                                <ButtonSwitch
                                    isOn={!advancedMode}
                                    handleToggle={handleToggle}
                                    id='advanced_reposition'
                                    onLabel='Unbalanced'
                                    offLabel='Balanced'
                                />
                                <RangeBounds
                                    isRangeBoundsDisabled={poolExists === true}
                                    {...rangeWidthProps}
                                    {...rangePriceInfoProps}
                                    {...minMaxPriceProps}
                                    customSwitch={true}
                                />

                                <ButtonToRender />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );

    const yes = true;

    if (yes) return newContent;

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
