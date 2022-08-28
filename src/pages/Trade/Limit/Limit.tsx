// START: Import React and Dongles
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useMoralis } from 'react-moralis';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { tickToPrice, CrocEnv, pinTickLower, pinTickUpper } from '@crocswap-libs/sdk';
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
            setLimitButtonErrorMessage('…');
        } else if (poolPriceDisplay === 0 || poolPriceDisplay === Infinity) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('Invalid Token Pair');
        }
    }, [poolPriceDisplay]);

    const clickLogin = () =>
        authenticateUser(isAuthenticated, isWeb3Enabled, authenticate, enableWeb3);

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
    const [limitTick, setLimitTick] = useState<number>(0);
    const [insideTickDisplayPrice, setInsideTickDisplayPrice] = useState<number>(0);

    const [initialLoad, setInitialLoad] = useState<boolean>(true);

    const isDenomBase = tradeData.isDenomBase;

    useEffect(() => {
        setInitialLoad(true);
    }, [tokenPair]);

    useEffect(() => {
        const limitRateInputField = document.getElementById(
            'limit-rate-quantity',
        ) as HTMLInputElement;
        if (initialLoad) {
            if (!provider) return;
            if (poolPriceNonDisplay === 0) return;

            const gridSize = lookupChain(chainId).gridSize;

            const croc = new CrocEnv(provider);
            const pool = croc.pool(tradeData.tokenA.address, tradeData.tokenB.address);
            const limitWei = pool.fromDisplayPrice(parseFloat(limitRate));

            const pinTick = limitWei.then((lw) =>
                isDenomBase ? pinTickLower(lw, gridSize) : pinTickUpper(lw, gridSize),
            );
            pinTick.then(setLimitTick);

            const tickPrice = pinTick.then(tickToPrice);
            const tickDispPrice = tickPrice.then((tp) => pool.toDisplayPrice(tp));

            tickDispPrice.then((tp) => {
                setInsideTickDisplayPrice(tp);
                if (limitRateInputField) {
                    limitRateInputField.value = tp.toString();
                }
                // dispatch(setLimitPrice(tp.toString()))
                setInitialLoad(false);
            });
        }
    }, [
        initialLoad,
        limitRate,
        poolPriceNonDisplay,
        baseDecimals,
        quoteDecimals,
        isDenomBase,
        isTokenABase,
    ]);

    const sendLimitOrder = async () => {
        console.log('Send limit');
        if (!provider || !(provider as ethers.providers.JsonRpcProvider).getSigner()) {
            return;
        }

        const sellToken = tradeData.tokenA.address;
        const buyToken = tradeData.tokenB.address;
        const sellQty = tokenAInputQty;
        const buyQty = tokenBInputQty;
        const qty = isTokenAPrimary ? sellQty : buyQty;

        const ko = new CrocEnv(provider).sell(sellToken, qty).atLimit(buyToken, limitTick);

        let tx;
        try {
            tx = await ko.mint();
        } catch (error) {
            setTxErrorCode(error?.code);
            setTxErrorMessage(error?.message);
        }
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
                initiateLimitOrderMethod={sendLimitOrder}
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
