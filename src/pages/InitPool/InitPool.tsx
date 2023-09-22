// START: Import React and Dongles
import { useContext, useEffect, useMemo, useState } from 'react';

// START: Import JSX Components
import InitPoolExtraInfo from '../../components/InitPool/InitPoolExtraInfo/InitPoolExtraInfo';
import Button from '../../components/Form/Button';

// START: Import Local Files
import styles from './InitPool.module.css';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';

import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../constants';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { AppStateContext } from '../../contexts/AppStateContext';
import { useAccount, useProvider } from 'wagmi';
import { useLinkGen, linkGenMethodsIF } from '../../utils/hooks/useLinkGen';
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import { exponentialNumRegEx } from '../../utils/regex/exports';

import { CachedDataContext } from '../../contexts/CachedDataContext';
import LocalTokenSelect from '../../components/Global/LocalTokenSelect/LocalTokenSelect';

import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { PoolContext } from '../../contexts/PoolContext';
import RangeBounds from '../../components/Global/RangeBounds/RangeBounds';
// import { toggleAdvancedMode } from '../../utils/state/tradeDataSlice';
import { LuEdit2 } from 'react-icons/lu';
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { FlexContainer } from '../../styled/Common';
import Toggle from '../../components/Form/Toggle';
import { TextOnlyTooltip } from '../../components/Global/StyledTooltip/StyledTooltip';
import { TokenContext } from '../../contexts/TokenContext';
import { useUrlParams } from '../../utils/hooks/useUrlParams';

import { useTokenBalancesAndAllowances } from '../../App/hooks/useTokenBalancesAndAllowances';
import InitTokenInput from './InitTokenInput/InitTokenInput';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';
import Spinner from '../../components/Global/Spinner/Spinner';
import AdvancedModeToggle from '../../components/Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import { getMoneynessRank } from '../../utils/functions/getMoneynessRank';
import { WarningBox } from '../../components/RangeActionModal/WarningBox/WarningBox';
import { ethereumMainnet } from '../../utils/networks/ethereumMainnet';
import InitSkeleton from './InitSkeleton';
import InitConfirmation from './InitConfirmation';
import MultiContentComponent from '../../components/Global/MultiStepTransaction/MultiContentComponent';
import { useSendInit } from '../../App/hooks/useSendInit';

import { useApprove } from '../../App/functions/approve';
// react functional component
export default function InitPool() {
    const provider = useProvider();

    const {
        wagmiModal: { open: openWagmiModalWallet },
    } = useContext(AppStateContext);
    const {
        crocEnv,
        ethMainnetUsdPrice,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const { dexBalRange } = useContext(UserPreferenceContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { poolPriceDisplay } = useContext(PoolContext);

    const { tokens } = useContext(TokenContext);
    useUrlParams(['chain', 'tokenA', 'tokenB'], tokens, chainId, provider);

    // const handleToggle = () => dispatch(toggleAdvancedMode());
    const {
        tradeData: { advancedMode },
    } = useAppSelector((state) => state);

    const { isConnected } = useAccount();

    // DO NOT combine these hooks with useMemo()
    // the useMemo() hook does NOT respect asynchronicity
    const [poolExists, setPoolExists] = useState<boolean | null>(null);

    const { approve, isApprovalPending } = useApprove();
    // const [isInitPending, setIsInitPending] = useState(false);

    const [initialPriceDisplay, setInitialPriceDisplay] = useState<string>('');

    const [initialPriceInBaseDenom, setInitialPriceInBaseDenom] = useState<
        number | undefined
    >();

    const [estimatedInitialPriceDisplay, setEstimatedInitialPriceDisplay] =
        useState<string>('0');
    // const [initialPriceForDOM, setInitialPriceForDOM] = useState<string>('');

    const { sessionReceipts } = useAppSelector((state) => state.receiptData);
    const {
        tradeData: { tokenA, tokenB, baseToken, quoteToken },
    } = useAppSelector((state) => state);
    useUrlParams(['chain', 'tokenA', 'tokenB'], tokens, chainId, provider);

    const {
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        tokenAAllowance,
        tokenBAllowance,

        isTokenABase,
        baseTokenAddress,
    } = useTokenBalancesAndAllowances(baseToken, quoteToken);

    const isBaseTokenMoneynessGreaterOrEqual =
        baseToken.symbol && quoteToken.symbol
            ? getMoneynessRank(baseToken.symbol) -
                  getMoneynessRank(quoteToken.symbol) >=
              0
            : false;

    const [isDenomBase, setIsDenomBase] = useState(false);

    useEffect(() => {
        setIsDenomBase(!isBaseTokenMoneynessGreaterOrEqual);
    }, [isBaseTokenMoneynessGreaterOrEqual]);

    const isTokenPairDefault =
        baseToken.address === ZERO_ADDRESS && quoteToken.symbol === 'USDC';

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

    const updateEstimatedInitialPrice = async () => {
        const mainnetBase =
            baseToken.address === ZERO_ADDRESS
                ? ethereumMainnet.tokens['WETH']
                : ethereumMainnet.tokens[
                      baseToken?.symbol as keyof typeof ethereumMainnet.tokens
                  ];
        const mainnetQuote =
            ethereumMainnet.tokens[
                quoteToken?.symbol as keyof typeof ethereumMainnet.tokens
            ];
        const basePricePromise = cachedFetchTokenPrice(
            mainnetBase,
            ethereumMainnet.chainId,
        );
        const quotePricePromise = cachedFetchTokenPrice(
            mainnetQuote,
            ethereumMainnet.chainId,
        );

        const basePrice = await basePricePromise;
        const quotePrice = await quotePricePromise;

        const isReferencePriceAvailable =
            basePrice !== undefined && quotePrice !== undefined;

        const baseUsdPrice = basePrice?.usdPrice || 2000;
        const quoteUsdPrice = quotePrice?.usdPrice || 1;

        const defaultPriceNumInBase = baseUsdPrice / quoteUsdPrice;

        const defaultPriceTruncated =
            defaultPriceNumInBase < 0.0001
                ? defaultPriceNumInBase.toExponential(2)
                : defaultPriceNumInBase < 2
                ? defaultPriceNumInBase.toPrecision(3)
                : defaultPriceNumInBase.toFixed(2);

        if (isReferencePriceAvailable && initialPriceDisplay === '') {
            setInitialPriceInBaseDenom(defaultPriceNumInBase);
        }
        if (isDenomBase) {
            setEstimatedInitialPriceDisplay(defaultPriceTruncated);
            isReferencePriceAvailable &&
            initialPriceDisplay === '' &&
            !isTokenPairDefault
                ? setInitialPriceDisplay(defaultPriceTruncated)
                : !initialPriceInBaseDenom
                ? setInitialPriceDisplay('')
                : undefined;
        } else {
            const invertedPriceNum = 1 / defaultPriceNumInBase;

            const invertedPriceTruncated =
                invertedPriceNum < 0.0001
                    ? invertedPriceNum.toExponential(2)
                    : invertedPriceNum < 2
                    ? invertedPriceNum.toPrecision(3)
                    : invertedPriceNum.toFixed(2);
            setEstimatedInitialPriceDisplay(invertedPriceTruncated);

            isReferencePriceAvailable &&
            initialPriceDisplay === '' &&
            !isTokenPairDefault
                ? setInitialPriceDisplay(invertedPriceTruncated)
                : !initialPriceInBaseDenom
                ? setInitialPriceDisplay('')
                : undefined;
        }
    };

    useEffect(() => {
        setInitialPriceInBaseDenom(undefined);
        setInitialPriceDisplay('');
    }, [baseToken, quoteToken]);

    useEffect(() => {
        (async () => {
            await updateEstimatedInitialPrice();
        })();
    }, [baseToken, quoteToken, isDenomBase]);

    useEffect(() => {
        handleDisplayUpdate();
    }, [isDenomBase]);

    const handleDisplayUpdate = () => {
        if (initialPriceDisplay) {
            if (isDenomBase) {
                setInitialPriceDisplay(
                    initialPriceInBaseDenom?.toString() ?? '',
                );
            } else {
                const invertedPriceNum = 1 / (initialPriceInBaseDenom ?? 1);

                const invertedPriceTruncated =
                    invertedPriceNum < 0.0001
                        ? invertedPriceNum.toExponential(2)
                        : invertedPriceNum < 2
                        ? invertedPriceNum.toPrecision(3)
                        : invertedPriceNum.toFixed(2);
                setInitialPriceDisplay(invertedPriceTruncated);
            }
        }
    };

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

    const focusInput = () => {
        const inputField = document.getElementById(
            'initial-pool-price-quantity',
        ) as HTMLInputElement;

        const timer = setTimeout(() => {
            inputField.focus();
            inputField.setSelectionRange(
                inputField.value.length,
                inputField.value.length,
            );
        }, 500);
        return () => clearTimeout(timer);
    };

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');
    // const { approve, isApprovalPending } = useApprove();

    // hooks to generate navigation actions with pre-loaded paths
    // const linkGenMarket: linkGenMethodsIF = useLinkGen('market');

    const { sendInit, isInitPending } = useSendInit();

    const placeholderText = `e.g. ${estimatedInitialPriceDisplay} (${
        isDenomBase ? baseToken.symbol : quoteToken.symbol
    }/${isDenomBase ? quoteToken.symbol : baseToken.symbol})`;

    const handleInitialPriceInputChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const isValid =
            event.target.value === '' ||
            event.target.value === '.' ||
            exponentialNumRegEx.test(event.target.value);
        const targetValue = event.target.value.replaceAll(',', '');
        const input = targetValue.startsWith('.')
            ? '0' + targetValue
            : targetValue;
        const targetValueNum = parseFloat(input);
        isValid && setInitialPriceDisplay(input);

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
                    initialPriceDisplay === '' ||
                    parseFloat(initialPriceDisplay.replaceAll(',', '')) <= 0
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
                        <Button
                            title='Confirm'
                            disabled={erc20TokenWithDexBalance !== undefined}
                            // action={sendInit}

                            action={() => sendInit(initialPriceInBaseDenom)}
                            flat={true}
                        />
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

    const tokenAApprovalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Approve ${tokenA.symbol}`
                    : `${tokenA.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenA.address, tokenA.symbol);
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
                await approve(tokenB.address, tokenB.symbol);
            }}
            flat={true}
        />
    );

    // Newwwwww Init code

    // eslint-disable-next-line
    const [tokenModalOpen, setTokenModalOpen] = useState(false);
    // eslint-disable-next-line
    const [baseCollateral, setBaseCollateral] = useState<string>('');
    // eslint-disable-next-line
    const [quoteCollateral, setQuoteCollateral] = useState<string>('');

    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);

    // See Range.tsx line 81
    const [rangeWidthPercentage, setRangeWidthPercentage] =
        useState<number>(23);
    const [
        // eslint-disable-next-line
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
    ] = useState(false);

    // eslint-disable-next-line
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
    // eslint-disable-next-line
    const [isAmbient, setIsAmbient] = useState(false);
    // eslint-disable-next-line
    const [pinnedMinPriceDisplayTruncated, setPinnedMinPriceDisplayTruncated] =
        useState('');
    // eslint-disable-next-line
    const [pinnedMaxPriceDisplayTruncated, setPinnedMaxPriceDisplayTruncated] =
        useState('');
    const minPriceDisplay = isAmbient ? '0' : pinnedMinPriceDisplayTruncated;
    const maxPriceDisplay = isAmbient
        ? 'Infinity'
        : pinnedMaxPriceDisplayTruncated;

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
    // eslint-disable-next-line
    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] =
        useState(-10);
    // eslint-disable-next-line
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] =
        useState(10);
    // eslint-disable-next-line
    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] =
        useState(false);
    // eslint-disable-next-line
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

    function goToNewUrlParams(
        chain: string,
        addrTokenA: string,
        addrTokenB: string,
    ): void {
        linkGenPool.navigate({
            chain: chain,
            tokenA: addrTokenA,
            tokenB: addrTokenB,
        });
    }

    const newUrlTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <p
                    onClick={() =>
                        goToNewUrlParams(
                            chainId,
                            tokenA.address,
                            tokenB.address,
                        )
                    }
                    className={styles.gen_link}
                >
                    {` Trade ${tokenA.symbol} / ${tokenB.symbol}`}{' '}
                    <FiExternalLink color='var(--accent6)' />
                </p>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <p className={styles.label_title} style={{ width: '80px' }}>
                Select Tokens
            </p>
        </TextOnlyTooltip>
    );

    console.log({ tokenModalOpen });
    const simpleTokenSelect = (
        <div className={styles.local_token_container}>
            {newUrlTooltip}
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
    const [isLoading, setIsLoading] = useState(false);
    const [isEditEnabled, setIsEditEnabled] = useState(false);

    const handleRefresh = () => {
        setIsLoading(true);
        (async () => {
            await updateEstimatedInitialPrice();
        })();

        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const openEditMode = () => {
        setIsEditEnabled(true);
        if (initialPriceDisplay === '') {
            setInitialPriceDisplay(estimatedInitialPriceDisplay);
            const targetValue = estimatedInitialPriceDisplay.replaceAll(
                ',',
                '',
            );

            const targetValueNum = parseFloat(targetValue);

            if (targetValue === '') {
                setInitialPriceInBaseDenom(undefined);
            } else {
                if (isDenomBase) {
                    setInitialPriceInBaseDenom(targetValueNum);
                } else {
                    setInitialPriceInBaseDenom(1 / targetValueNum);
                }
            }
        }
        focusInput();
    };

    const initPriceContainer = (
        <div
            className={`${styles.pool_price_container} ${
                poolExists === true && styles.content_disabled
            }`}
        >
            <FlexContainer flexDirection='row' justifyContent='space-between'>
                <p className={styles.label_title}>Initial Price</p>

                <FlexContainer gap={8}>
                    <LuEdit2 size={20} onClick={() => openEditMode()} />
                    <FiRefreshCw size={20} onClick={handleRefresh} />
                </FlexContainer>
            </FlexContainer>
            <section
                style={{ width: '100%' }}
                onDoubleClick={() => openEditMode()}
            >
                {isLoading ? (
                    <div className={styles.circular_progress}>
                        <Spinner size={24} bg='var(--dark2)' weight={2} />
                    </div>
                ) : (
                    <input
                        disabled={!isEditEnabled}
                        id='initial-pool-price-quantity'
                        className={`${styles.currency_quantity} `}
                        placeholder={placeholderText}
                        type='string'
                        onChange={handleInitialPriceInputChange}
                        onBlur={() => setIsEditEnabled(false)}
                        value={initialPriceDisplay}
                        inputMode='decimal'
                        autoComplete='off'
                        autoCorrect='off'
                        min='0'
                        minLength={1}
                    />
                )}
            </section>
        </div>
    );
    const handleBaseCollateralChange = (input: string) => {
        setBaseCollateral(input);
        // rest of code here
    };
    const handleQuoteCollateralChange = (input: string) => {
        setQuoteCollateral(input);
        // rest of code here
    };

    const toggleDexSelection = (tokenAorB: 'A' | 'B') => {
        if (tokenAorB === 'A') {
            setIsWithdrawTokenAFromDexChecked(!isWithdrawTokenAFromDexChecked);
            console.log('toggled');
        } else {
            setIsWithdrawTokenBFromDexChecked(!isWithdrawTokenBFromDexChecked);
        }
    };
    const [isMintLiq, setIsMinLiq] = useState(true);

    const isRangeBoundsAndCollateralDisabled =
        poolExists === true || !isMintLiq;

    const collateralContent = (
        <div
            className={`${styles.collateral_container} ${
                isRangeBoundsAndCollateralDisabled
                    ? styles.content_disabled
                    : ''
            }`}
        >
            <FlexContainer flexDirection='row' justifyContent='space-between'>
                <p className={styles.label_title}>Collateral</p>
            </FlexContainer>

            <InitTokenInput
                tokenA={tokenA}
                tokenB={tokenB}
                baseTokenAddress={baseTokenAddress}
                tokenABalance={baseTokenBalance}
                tokenBBalance={quoteTokenBalance}
                tokenADexBalance={baseTokenDexBalance}
                tokenBDexBalance={quoteTokenDexBalance}
                isWithdrawTokenAFromDexChecked={false}
                isWithdrawTokenBFromDexChecked={false}
                handleTokenAChangeEvent={handleBaseCollateralChange}
                handleTokenBChangeEvent={handleQuoteCollateralChange}
                tokenAInputQty={{
                    value: baseCollateral,
                    set: setBaseCollateral,
                }}
                tokenBInputQty={{
                    value: quoteCollateral,
                    set: setQuoteCollateral,
                }}
                toggleDexSelection={toggleDexSelection}
                disabled={poolExists === true}
                reverseTokens={() => console.log('reversed')}
            />
        </div>
    );

    const mintInitialLiquidity = (
        <FlexContainer
            flexDirection='row'
            justifyContent='space-between'
            className={poolExists && styles.content_disabled}
        >
            <p className={styles.label_title}>Mint Initial Liquidity</p>

            <Toggle
                id='init_mint_liq'
                isOn={isMintLiq}
                disabled={poolExists === true}
                handleToggle={() => setIsMinLiq(!isMintLiq)}
            />
        </FlexContainer>
    );

    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const erc20TokenWithDexBalance = useMemo(() => {
        if (baseToken?.address !== ZERO_ADDRESS) {
            if (baseTokenDexBalance && baseTokenDexBalance !== '0.0') {
                return baseToken;
            }
        }
        if (quoteTokenDexBalance && quoteTokenDexBalance !== '0.0') {
            return quoteToken;
        }
        return undefined;
    }, [baseToken, quoteToken, baseTokenDexBalance, quoteTokenDexBalance]);

    useEffect(() => {
        if (poolExists) {
            setShowErrorMessage(false);
        } else if (erc20TokenWithDexBalance) {
            setShowErrorMessage(true);
        } else {
            setShowErrorMessage(false);
        }
    }, [erc20TokenWithDexBalance, poolExists]);

    const [activeContent, setActiveContent] = useState<string>('main');

    const handleSetActiveContent = (newActiveContent: string) => {
        setActiveContent(newActiveContent);
    };

    const mainContent = (
        <InitSkeleton
            isTokenModalOpen={tokenModalOpen}
            isConfirmation={false}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
            title='Initialize Pool'
        >
            <div className={styles.left_container}>
                {simpleTokenSelect}
                {initPriceContainer}
                {collateralContent}
            </div>

            <div className={styles.right_container}>
                {mintInitialLiquidity}
                <div
                    className={
                        isRangeBoundsAndCollateralDisabled
                            ? styles.content_disabled
                            : ''
                    }
                >
                    <AdvancedModeToggle advancedMode={advancedMode} />
                </div>

                <RangeBounds
                    isRangeBoundsDisabled={isRangeBoundsAndCollateralDisabled}
                    {...rangeWidthProps}
                    {...rangePriceInfoProps}
                    {...minMaxPriceProps}
                    customSwitch={true}
                />

                {showErrorMessage ? (
                    <div style={{ padding: '0 40px' }}>
                        <WarningBox
                            details={`Due to a known issue, you currently need to completely withdraw your ${erc20TokenWithDexBalance?.symbol} exchange balance before proceeding with pool initialization.`}
                        />
                    </div>
                ) : (
                    <div
                        className={
                            poolExists === true ? styles.content_disabled : ''
                        }
                    >
                        <InitPoolExtraInfo
                            initialPrice={parseFloat(
                                initialPriceDisplay.replaceAll(',', ''),
                            )}
                            isDenomBase={isDenomBase}
                            initGasPriceinDollars={initGasPriceinDollars}
                            baseToken={baseToken}
                            quoteToken={quoteToken}
                            setIsDenomBase={setIsDenomBase}
                        />
                    </div>
                )}

                <ButtonToRender />
            </div>
        </InitSkeleton>
    );

    const confirmationContent = (
        <InitSkeleton
            isTokenModalOpen={tokenModalOpen}
            isConfirmation={true}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
            title='Confirmation'
        >
            <InitConfirmation
                activeContent={activeContent}
                setActiveContent={setActiveContent}
            />
        </InitSkeleton>
    );

    const settingsContent = (
        <InitSkeleton
            isTokenModalOpen={tokenModalOpen}
            isConfirmation={true}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
            title='Settings'
        >
            <InitConfirmation
                activeContent={activeContent}
                setActiveContent={setActiveContent}
            />
        </InitSkeleton>
    );

    const exampleContent3 = (
        <InitSkeleton
            isTokenModalOpen={tokenModalOpen}
            isConfirmation={true}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
            title='Example content 3'
        >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim,
            doloremque?
        </InitSkeleton>
    );

    const otherContents = [
        { title: 'Example Content 3', content: exampleContent3 },
    ];
    return (
        <MultiContentComponent
            mainContent={mainContent}
            settingsContent={settingsContent}
            confirmationContent={confirmationContent}
            activeContent={activeContent}
            setActiveContent={handleSetActiveContent}
            otherContents={otherContents}
        />
    );
}
