// START: Import React and Dongles
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useMoralis, useChain } from 'react-moralis';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { MIN_TICK, MAX_TICK, tickToPrice, toDisplayPrice, CrocEnv } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

// START: Import React Functional Components
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import LimitButton from '../../../components/Trade/Limit/LimitButton/LimitButton';
import LimitCurrencyConverter from '../../../components/Trade/Limit/LimitCurrencyConverter/LimitCurrencyConverter';
import DenominationSwitch from '../../../components/Swap/DenominationSwitch/DenominationSwitch';
import LimitExtraInfo from '../../../components/Trade/Limit/LimitExtraInfo/LimitExtraInfo';
import LimitHeader from '../../../components/Trade/Limit/LimitHeader/LimitHeader';
import DividerDark from '../../../components/Global/DividerDark/DividerDark';
import Modal from '../../../components/Global/Modal/Modal';
import Button from '../../../components/Global/Button/Button';
import ConfirmLimitModal from '../../../components/Trade/Limit/ConfirmLimitModal/ConfirmLimitModal';

// START: Import Local Files
import styles from './Limit.module.css';
import authenticateUser from '../../../utils/functions/authenticateUser';
import { useTradeData } from '../Trade';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { useModal } from '../../../components/Global/Modal/useModal';
import { SlippagePairIF, TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { setLimitPrice } from '../../../utils/state/tradeDataSlice';

interface LimitPropsIF {
    importedTokens: Array<TokenIF>;
    searchableTokens: Array<TokenIF>;
    mintSlippage: SlippagePairIF;
    isPairStable: boolean;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    provider?: ethers.providers.Provider;
    isOnTradeRoute?: boolean;
    gasPriceinGwei: string;
    nativeBalance: string;
    lastBlockNumber: number;
    tokenABalance: string;
    tokenBBalance: string;
    isSellTokenBase: boolean;
    tokenPair: TokenPairIF;
    isTokenABase: boolean;
    poolPriceDisplay: number | undefined;
    poolPriceNonDisplay: number | undefined;
    tokenAAllowance: string;
    setRecheckTokenAApproval: Dispatch<SetStateAction<boolean>>;

    chainId: string;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
}

export default function Limit(props: LimitPropsIF) {
    const {
        importedTokens,
        searchableTokens,
        mintSlippage,
        isPairStable,
        setImportedTokens,
        provider,
        isSellTokenBase,
        tokenABalance,
        tokenBBalance,
        tokenPair,
        isTokenABase,
        gasPriceinGwei,
        poolPriceDisplay,
        poolPriceNonDisplay,
        tokenAAllowance,
        setRecheckTokenAApproval,
        chainId,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;

    const { tradeData } = useTradeData();
    const { navigationMenu } = useTradeData();
    const dispatch = useAppDispatch();
    const { enableWeb3, isWeb3Enabled, authenticate, isAuthenticated } = useMoralis();
    const { switchNetwork } = useChain();
    const [isModalOpen, openModal, closeModal] = useModal();
    const [limitAllowed, setLimitAllowed] = useState<boolean>(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');
    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] = useState(false);

    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] = useState(false);

    const [limitButtonErrorMessage, setLimitButtonErrorMessage] = useState<string>('');

    useEffect(() => {
        if (poolPriceDisplay === undefined) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('...');
        } else if (poolPriceDisplay === 0 || poolPriceDisplay === Infinity) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('Invalid Token Pair');
        }
    }, [poolPriceDisplay]);

    const clickLogin = () => authenticateUser(
        isAuthenticated,
        isWeb3Enabled,
        authenticate,
        enableWeb3,
        switchNetwork
    );

    const [newLimitOrderTransactionHash, setNewLimitOrderTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');

    const tokenADecimals = tokenPair.dataTokenA.decimals;
    const tokenBDecimals = tokenPair.dataTokenB.decimals;

    const baseDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const isTokenAPrimary = tradeData.isTokenAPrimary;

    const slippageTolerancePercentage = tradeData.slippageTolerance;

    const [limitRate, setLimitRate] = useState<string>(tradeData.limitPrice);
    const [insideTickDisplayPrice, setInsideTickDisplayPrice] = useState<number>(0);

    const [initialLoad, setInitialLoad] = useState<boolean>(true);

    const isDenomBase = tradeData.isDenomBase;

    const gridSize = lookupChain(chainId).gridSize;

    const roundDownTick = (tick: number, nTicksGrid: number = gridSize) => {
        const tickGrid = Math.floor(tick / nTicksGrid) * nTicksGrid;
        const horizon = Math.floor(MIN_TICK / nTicksGrid) * nTicksGrid;
        return Math.max(tickGrid, horizon);
    };

    const roundUpTick = (tick: number, nTicksGrid: number = gridSize) => {
        const tickGrid = Math.ceil(tick / nTicksGrid) * nTicksGrid;
        const horizon = Math.ceil(MAX_TICK / nTicksGrid) * nTicksGrid;
        return Math.min(tickGrid, horizon);
    };

    const currentPoolPriceTick = poolPriceNonDisplay
        ? Math.log(poolPriceNonDisplay) / Math.log(1.0001)
        : 0;

    useEffect(() => {
        setInitialLoad(true);
    }, [tokenPair]);

    useEffect(() => {
        const limitRateInputField = document.getElementById(
            'limit-rate-quantity',
        ) as HTMLInputElement;
        if (initialLoad) {
            if (poolPriceNonDisplay === 0) return;

            // console.log({ currentPoolPriceTick });
            let roundedTickInsideCurrentPrice: number;
            let pinnedInitialDisplayPrice: string;

            if (isDenomBase) {
                const offset = gridSize;
                isTokenABase
                    ? (roundedTickInsideCurrentPrice = roundDownTick(currentPoolPriceTick - offset))
                    : (roundedTickInsideCurrentPrice = roundUpTick(currentPoolPriceTick + offset));

                // console.log({ roundedTickInsideCurrentPrice });
                const insideTickNonDisplayPrice = tickToPrice(roundedTickInsideCurrentPrice);
                const insideTickDisplay = (
                    1 / toDisplayPrice(insideTickNonDisplayPrice, baseDecimals, quoteDecimals)
                ).toPrecision(6);

                setInsideTickDisplayPrice(parseFloat(insideTickDisplay));

                pinnedInitialDisplayPrice = insideTickDisplay;

                if (limitRateInputField) {
                    limitRateInputField.value = insideTickDisplay;
                }
            } else {
                const offset = gridSize;
                // roundedTickInsideCurrentPrice = roundDownTick(currentPoolPriceTick - offset);
                // roundedTickInsideCurrentPrice = roundUpTick(currentPoolPriceTick + offset);
                isTokenABase
                    ? (roundedTickInsideCurrentPrice = roundDownTick(currentPoolPriceTick - offset))
                    : (roundedTickInsideCurrentPrice = roundUpTick(currentPoolPriceTick + offset));

                // console.log({ roundedTickInsideCurrentPrice });
                const insideTickNonDisplayPrice = tickToPrice(roundedTickInsideCurrentPrice);

                const insideTickDisplay = toDisplayPrice(
                    insideTickNonDisplayPrice,
                    baseDecimals,
                    quoteDecimals,
                ).toPrecision(6);

                setInsideTickDisplayPrice(parseFloat(insideTickDisplay));

                pinnedInitialDisplayPrice = insideTickDisplay;

                if (limitRateInputField) {
                    limitRateInputField.value = insideTickDisplay;
                }
            }
            dispatch(setLimitPrice(pinnedInitialDisplayPrice));
            setLimitRate(pinnedInitialDisplayPrice);
            setInitialLoad(false);
        }
    }, [initialLoad, poolPriceNonDisplay, baseDecimals, quoteDecimals, isDenomBase, isTokenABase]);

    const initiateLimitOrderMethod = async () => {
        /* const sellTokenAddress = tokenA.address;
        const buyTokenAddress = tokenB.address;
        const poolId = lookupChain(chainId).poolIndex;
        const sellTokenQty = tokenAInputQty;
        const buyTokenQty = tokenBInputQty;
        const qty = isTokenAPrimary ? sellTokenQty : buyTokenQty;*/
    };

    const handleModalClose = () => {
        closeModal();
        setNewLimitOrderTransactionHash('');
        setTxErrorCode(0);
        setTxErrorMessage('');
    };

    const confirmLimitModalOrNull = isModalOpen ? (
        <Modal onClose={handleModalClose} title='Limit Confirmation'>
            <ConfirmLimitModal
                onClose={handleModalClose}
                tokenPair={tokenPair}
                initiateLimitOrderMethod={initiateLimitOrderMethod}
                tokenAInputQty={tokenAInputQty}
                tokenBInputQty={tokenBInputQty}
                isTokenAPrimary={isTokenAPrimary}
                limitRate={limitRate}
                newLimitOrderTransactionHash={newLimitOrderTransactionHash}
                txErrorCode={txErrorCode}
                txErrorMessage={txErrorMessage}
            />
        </Modal>
    ) : null;

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) >= parseFloat(tokenAInputQty);
    const loginButton = <Button title='Login' action={clickLogin} />;
    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const approve = async (tokenAddress: string) => {
        if (!provider) {
            return;
        }
        setIsApprovalPending(true);
        try {
            const tx = await new CrocEnv(provider).token(tokenAddress).approve();
            if (tx) {
                await tx.wait();
            }
        } catch (error) {
            console.log({ error });
        } finally {
            setIsApprovalPending(false);
            setRecheckTokenAApproval(true);
        }
    };

    const approvalButton = (
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
    return (
        <section>
            <ContentContainer isOnTradeRoute>
                <LimitHeader
                    chainId={chainId}
                    tokenPair={tokenPair}
                    mintSlippage={mintSlippage}
                    isPairStable={isPairStable}
                    isDenomBase={tradeData.isDenomBase}
                    isTokenABase={isTokenABase}
                />
                <DividerDark addMarginTop />
                {navigationMenu}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <LimitCurrencyConverter
                        tokenPair={tokenPair}
                        searchableTokens={searchableTokens}
                        poolPriceNonDisplay={poolPriceNonDisplay}
                        isSellTokenBase={isSellTokenBase}
                        tokensBank={importedTokens}
                        setImportedTokens={setImportedTokens}
                        chainId={chainId}
                        setLimitAllowed={setLimitAllowed}
                        tokenABalance={tokenABalance}
                        tokenBBalance={tokenBBalance}
                        // tokenABalance={truncateDecimals(parseFloat(tokenABalance), 4).toString()}
                        // tokenBBalance={truncateDecimals(parseFloat(tokenBBalance), 4).toString()}
                        tokenAInputQty={tokenAInputQty}
                        tokenBInputQty={tokenBInputQty}
                        setTokenAInputQty={setTokenAInputQty}
                        isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                        setTokenBInputQty={setTokenBInputQty}
                        setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                        setLimitButtonErrorMessage={setLimitButtonErrorMessage}
                        isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                        setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                        limitRate={limitRate}
                        setLimitRate={setLimitRate}
                        insideTickDisplayPrice={insideTickDisplayPrice}
                        isDenominationInBase={tradeData.isDenomBase}
                        activeTokenListsChanged={activeTokenListsChanged}
                        indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
                    />
                </motion.div>
                <div className={styles.header_container}>
                    <DividerDark addMarginTop />
                    <DenominationSwitch
                        tokenPair={tokenPair}
                        displayForBase={tradeData.isDenomBase}
                        poolPriceDisplay={poolPriceDisplay}
                        isTokenABase={isSellTokenBase}
                        didUserFlipDenom={tradeData.didUserFlipDenom}
                    />
                </div>
                <LimitExtraInfo
                    tokenPair={tokenPair}
                    gasPriceinGwei={gasPriceinGwei}
                    poolPriceDisplay={poolPriceDisplay || 0}
                    slippageTolerance={slippageTolerancePercentage}
                    liquidityProviderFee={0}
                    quoteTokenIsBuy={true}
                    didUserFlipDenom={tradeData.didUserFlipDenom}
                    isTokenABase={isSellTokenBase}
                    isDenomBase={isDenomBase}
                    limitRate={limitRate}
                />
                {isAuthenticated && isWeb3Enabled ? (
                    !isTokenAAllowanceSufficient && parseFloat(tokenAInputQty) > 0 ? (
                        approvalButton
                    ) : (
                        <LimitButton
                            onClickFn={openModal}
                            limitAllowed={poolPriceNonDisplay !== 0 && limitAllowed}
                            limitButtonErrorMessage={limitButtonErrorMessage}
                        />
                    )
                ) : (
                    loginButton
                )}
            </ContentContainer>
            {confirmLimitModalOrNull}
        </section>
    );
}
