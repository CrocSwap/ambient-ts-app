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
    gasPriceinGwei: number | undefined;
    nativeBalance: string;
    lastBlockNumber: number;
    baseTokenBalance: string;
    quoteTokenBalance: string;
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
    openModalWallet: () => void;
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
        baseTokenBalance,
        quoteTokenBalance,
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
        openModalWallet,
    } = props;

    const { tradeData, navigationMenu } = useTradeData();
    const dispatch = useAppDispatch();
    const { isWeb3Enabled, isAuthenticated } = useMoralis();
    const [isModalOpen, openModal, closeModal] = useModal();
    const [limitAllowed, setLimitAllowed] = useState<boolean>(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');
    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] = useState(false);

    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] = useState(false);

    const [limitButtonErrorMessage, setLimitButtonErrorMessage] = useState<string>('');
    const [priceInputFieldBlurred, setPriceInputFieldBlurred] = useState(false);

    const priceInputOnBlur = () => setPriceInputFieldBlurred(true);

    useEffect(() => {
        if (poolPriceDisplay === undefined) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('…');
        } else if (poolPriceDisplay === 0 || poolPriceDisplay === Infinity) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('Invalid Token Pair');
        }
    }, [poolPriceDisplay]);

    const [newLimitOrderTransactionHash, setNewLimitOrderTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');

    // const tokenADecimals = tokenPair.dataTokenA.decimals;
    // const tokenBDecimals = tokenPair.dataTokenB.decimals;

    // const baseDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    // const quoteDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const isTokenAPrimary = tradeData.isTokenAPrimary;

    const slippageTolerancePercentage = tradeData.slippageTolerance;

    const [limitRate, setLimitRate] = useState<string>(tradeData.limitPrice);
    const [limitTick, setLimitTick] = useState<number>(0);
    const [insideTickDisplayPrice, setInsideTickDisplayPrice] = useState<number>(0);

    const [initialLoad, setInitialLoad] = useState<boolean>(true);

    const isDenomBase = tradeData.isDenomBase;

    useEffect(() => {
        setInitialLoad(true);
    }, [
        JSON.stringify({
            isDenomBase: isDenomBase,
            tokenA: tradeData.tokenA.address,
            tokenB: tradeData.tokenB.address,
        }),
    ]);

    useEffect(() => {
        if (initialLoad) {
            if (!provider) return;
            if (!poolPriceDisplay) return;

            const gridSize = lookupChain(chainId).gridSize;

            const croc = new CrocEnv(provider);
            const pool = croc.pool(tradeData.tokenA.address, tradeData.tokenB.address);

            const initialLimitRate = isDenomBase
                ? (1 / poolPriceDisplay) * (isSellTokenBase ? 1.02 : 0.98)
                : poolPriceDisplay * (isSellTokenBase ? 0.98 : 1.02);

            setLimitRate(initialLimitRate.toString());

            const limitWei = pool.fromDisplayPrice(initialLimitRate);

            const pinTick = limitWei.then((lw) =>
                isDenomBase ? pinTickLower(lw, gridSize) : pinTickUpper(lw, gridSize),
            );
            pinTick.then(setLimitTick);

            const tickPrice = pinTick.then(tickToPrice);
            const tickDispPrice = tickPrice.then((tp) => pool.toDisplayPrice(tp));

            tickDispPrice.then((tp) => {
                // console.log({ tp });
                setInsideTickDisplayPrice(tp);
                dispatch(setLimitPrice(tp.toString()));
                setInitialLoad(false);
                const limitRateTruncated =
                    tp < 2
                        ? tp.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                          })
                        : tp.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });
                const limitRateInputField = document.getElementById('limit-rate-quantity');
                if (limitRateInputField)
                    (limitRateInputField as HTMLInputElement).value = limitRateTruncated;
            });
        } else {
            if (!provider) return;
            if (poolPriceNonDisplay === 0) return;
            if (!priceInputFieldBlurred) return;

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
                dispatch(setLimitPrice(tp.toString()));
                setInitialLoad(false);
                const limitRateTruncated =
                    tp < 2
                        ? tp.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                          })
                        : tp.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });
                const limitRateInputField = document.getElementById('limit-rate-quantity');
                if (limitRateInputField)
                    (limitRateInputField as HTMLInputElement).value = limitRateTruncated;
            });
            setPriceInputFieldBlurred(false);
        }
    }, [
        initialLoad,
        limitRate,
        poolPriceDisplay,
        isSellTokenBase,
        isDenomBase,
        priceInputFieldBlurred,
    ]);

    const sendLimitOrder = async () => {
        console.log('Send limit');
        if (!provider || !(provider as ethers.providers.WebSocketProvider).getSigner()) {
            return;
        }

        const sellToken = tradeData.tokenA.address;
        const buyToken = tradeData.tokenB.address;
        const sellQty = tokenAInputQty;
        const buyQty = tokenBInputQty;
        const qty = isTokenAPrimary ? sellQty : buyQty;

        const seller = new CrocEnv(provider).sell(sellToken, qty);
        const ko = seller.atLimit(buyToken, limitTick);

        if (await ko.willFail()) {
            console.log('Cannot send limit order: Knockout price inside spread');
            setTxErrorMessage('Limit inside market price');
            return;
        }

        try {
            const mint = await ko.mint();
            console.log(mint.hash);
            setNewLimitOrderTransactionHash(mint.hash);
            const limitOrderReceipt = await mint.wait();
            console.log({ limitOrderReceipt });
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
    const loginButton = <Button title='Login' action={openModalWallet} />;
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

    const tokenABalance = isTokenABase ? baseTokenBalance : quoteTokenBalance;
    const tokenBBalance = isTokenABase ? quoteTokenBalance : baseTokenBalance;

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
                    // tokenPair={tokenPair}
                    mintSlippage={mintSlippage}
                    isPairStable={isPairStable}
                    // isDenomBase={tradeData.isDenomBase}
                    // isTokenABase={isTokenABase}
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
                        priceInputOnBlur={priceInputOnBlur}
                        insideTickDisplayPrice={insideTickDisplayPrice}
                        isDenominationInBase={tradeData.isDenomBase}
                        activeTokenListsChanged={activeTokenListsChanged}
                        indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
                    />
                </motion.div>
                <div className={styles.header_container}>
                    <DividerDark addMarginTop />
                    <DenominationSwitch />
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
