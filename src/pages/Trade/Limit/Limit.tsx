// START: Import React and Dongles
import { useMoralis } from 'react-moralis';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import Button from '../../../components/Global/Button/Button';

import {
    approveToken,
    POOL_PRIMARY,
    contractAddresses,
    sendSwap,
    GRID_SIZE_DFLT,
    MIN_TICK,
    MAX_TICK,
    tickToPrice,
    toDisplayPrice,
} from '@crocswap-libs/sdk';

// START: Import React Functional Components
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import LimitButton from '../../../components/Trade/Limit/LimitButton/LimitButton';
import LimitCurrencyConverter from '../../../components/Trade/Limit/LimitCurrencyConverter/LimitCurrencyConverter';
import DenominationSwitch from '../../../components/Swap/DenominationSwitch/DenominationSwitch';
import LimitExtraInfo from '../../../components/Trade/Limit/LimitExtraInfo/LimitExtraInfo';
import LimitHeader from '../../../components/Trade/Limit/LimitHeader/LimitHeader';
import DividerDark from '../../../components/Global/DividerDark/DividerDark';
import Modal from '../../../components/Global/Modal/Modal';
import ConfirmLimitModal from '../../../components/Trade/Limit/ConfirmLimitModal/ConfirmLimitModal';
import { JsonRpcProvider } from '@ethersproject/providers';

import truncateDecimals from '../../../utils/data/truncateDecimals';

// START: Import Local Files
import { useTradeData } from '../Trade';
import { useModal } from '../../../components/Global/Modal/useModal';
import { TokenIF } from '../../../utils/interfaces/exports';
import { setLimitPrice } from '../../../utils/state/tradeDataSlice';

interface LimitPropsIF {
    importedTokens: Array<TokenIF>;
    provider: JsonRpcProvider;
    isOnTradeRoute?: boolean;
    gasPriceinGwei: string;
    nativeBalance: string;
    lastBlockNumber: number;
    tokenABalance: string;
    tokenBBalance: string;
    isSellTokenBase: boolean;
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    isTokenABase: boolean;
    poolPriceDisplay: number;
    poolPriceNonDisplay: number;
    tokenAAllowance: string;
    setRecheckTokenAApproval: React.Dispatch<React.SetStateAction<boolean>>;
    chainId: string,
}

export default function Limit(props: LimitPropsIF) {
    const {
        importedTokens,
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
        chainId
    } = props;
    const { tradeData } = useTradeData();
    const dispatch = useAppDispatch();
    const { enableWeb3, isWeb3Enabled, authenticate, isAuthenticated } = useMoralis();
    const [isModalOpen, openModal, closeModal] = useModal();
    const [limitAllowed, setLimitAllowed] = useState<boolean>(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');
    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] = useState(false);

    const [isWithdrawToWalletChecked, setIsWithdrawToWalletChecked] = useState(true);

    const [limitButtonErrorMessage, setLimitButtonErrorMessage] = useState<string>('');

    // login functionality
    const clickLogin = () => {
        console.log('user clicked Login');
        if (!isAuthenticated || !isWeb3Enabled) {
            authenticate({
                provider: 'metamask',
                signingMessage: 'Ambient API Authentication.',
                onSuccess: () => {
                    enableWeb3();
                },
                onError: () => {
                    authenticate({
                        provider: 'metamask',
                        signingMessage: 'Ambient API Authentication.',
                        onSuccess: () => {
                            enableWeb3;
                            // alert('🎉');
                        },
                    });
                },
            });
        }
    };

    const [newLimitOrderTransactionHash, setNewLimitOrderTransactionHash] = useState('');

    const tokenA = tokenPair.dataTokenA;
    const tokenB = tokenPair.dataTokenB;

    const tokenADecimals = tokenPair.dataTokenA.decimals;
    const tokenBDecimals = tokenPair.dataTokenB.decimals;

    const baseDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const isTokenAPrimary = tradeData.isTokenAPrimary;

    const [limitRate, setLimitRate] = useState<string>(tradeData.limitPrice);
    const [insideTickDisplayPrice, setInsideTickDisplayPrice] = useState<number>(0);

    const [initialLoad, setInitialLoad] = useState<boolean>(true);

    const isDenomBase = tradeData.isDenomBase;

    const roundDownTick = (tick: number, nTicksGrid: number = GRID_SIZE_DFLT) => {
        const tickGrid = Math.floor(tick / nTicksGrid) * nTicksGrid;
        const horizon = Math.floor(MIN_TICK / nTicksGrid) * nTicksGrid;
        return Math.max(tickGrid, horizon);
    };

    const roundUpTick = (tick: number, nTicksGrid: number = GRID_SIZE_DFLT) => {
        const tickGrid = Math.ceil(tick / nTicksGrid) * nTicksGrid;
        const horizon = Math.ceil(MAX_TICK / nTicksGrid) * nTicksGrid;
        return Math.min(tickGrid, horizon);
    };

    const currentPoolPriceTick = Math.log(poolPriceNonDisplay) / Math.log(1.0001);

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
                const offset = GRID_SIZE_DFLT;
                isTokenABase
                    ? (roundedTickInsideCurrentPrice = roundDownTick(currentPoolPriceTick - offset))
                    : (roundedTickInsideCurrentPrice = roundUpTick(currentPoolPriceTick + offset));

                // console.log({ roundedTickInsideCurrentPrice });
                const insideTickNonDisplayPrice = tickToPrice(roundedTickInsideCurrentPrice);
                const insideTickDisplayPrice =
                    1 / toDisplayPrice(insideTickNonDisplayPrice, baseDecimals, quoteDecimals);

                setInsideTickDisplayPrice(insideTickDisplayPrice);

                pinnedInitialDisplayPrice = insideTickDisplayPrice.toString();

                if (limitRateInputField) {
                    limitRateInputField.value = pinnedInitialDisplayPrice;
                }
            } else {
                const offset = GRID_SIZE_DFLT;
                // roundedTickInsideCurrentPrice = roundDownTick(currentPoolPriceTick - offset);
                // roundedTickInsideCurrentPrice = roundUpTick(currentPoolPriceTick + offset);
                isTokenABase
                    ? (roundedTickInsideCurrentPrice = roundDownTick(currentPoolPriceTick - offset))
                    : (roundedTickInsideCurrentPrice = roundUpTick(currentPoolPriceTick + offset));

                // console.log({ roundedTickInsideCurrentPrice });
                const insideTickNonDisplayPrice = tickToPrice(roundedTickInsideCurrentPrice);
                const insideTickDisplayPrice = toDisplayPrice(
                    insideTickNonDisplayPrice,
                    baseDecimals,
                    quoteDecimals,
                );
                setInsideTickDisplayPrice(insideTickDisplayPrice);

                pinnedInitialDisplayPrice = insideTickDisplayPrice.toString();

                if (limitRateInputField) {
                    limitRateInputField.value = pinnedInitialDisplayPrice;
                }
            }
            dispatch(setLimitPrice(pinnedInitialDisplayPrice));
            setLimitRate(pinnedInitialDisplayPrice);
            setInitialLoad(false);
        }
    }, [initialLoad, poolPriceNonDisplay, baseDecimals, quoteDecimals, isDenomBase, isTokenABase]);

    const initiateLimitOrderMethod = async () => {
        const sellTokenAddress = tokenA.address;
        const buyTokenAddress = tokenB.address;
        const poolId = POOL_PRIMARY;
        const slippageTolerancePercentage = 5;
        const sellTokenQty = tokenAInputQty;
        const buyTokenQty = tokenBInputQty;
        const qty = isTokenAPrimary ? sellTokenQty : buyTokenQty;

        // console.log({ isTokenAPrimary });

        // console.log({ limitRate });

        // overwritten by a non-zero value when selling ETH for another token
        let ethValue = '0';

        // if the user is selling ETH and requesting an exact output quantity
        // then pad the ETH sent to the contract by 2% (remainder will be returned)
        if (sellTokenAddress === contractAddresses.ZERO_ADDR) {
            const roundedUpEthValue = truncateDecimals(
                parseFloat(sellTokenQty) * 1.02,
                18,
            ).toString();
            isTokenAPrimary ? (ethValue = sellTokenQty) : (ethValue = roundedUpEthValue);
        }

        if (signer) {
            const tx = await sendSwap(
                sellTokenAddress,
                buyTokenAddress,
                isTokenAPrimary,
                qty,
                ethValue,
                slippageTolerancePercentage,
                poolId,
                signer,
            );

            const newTransactionHash = tx.hash;
            setNewLimitOrderTransactionHash(newTransactionHash);
            // let parsedReceipt;

            // try {
            //     const receipt = await tx.wait();
            //     console.log({ receipt });
            //     parsedReceipt = await parseSwapEthersReceipt(provider, receipt as EthersNativeReceipt);
            // } catch (e) {
            //     const error = e as TransactionError;
            //     if (isTransactionReplacedError(error)) {
            //         // The user used "speed up" or something similar
            //         // in their client, but we now have the updated info
            //         console.log('repriced');
            //         newTransactionHash = error.replacement.hash;
            //         console.log({ newTransactionHash });
            //         parsedReceipt = await parseSwapEthersReceipt(
            //             provider,
            //             error.receipt as EthersNativeReceipt,
            //         );
            //     }
            // }
            // if (parsedReceipt) handleParsedReceipt(Moralis, 'swap', newTransactionHash, parsedReceipt);
        }
    };

    const confirmLimitModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Limit Confirmation'>
            <ConfirmLimitModal
                onClose={closeModal}
                tokenPair={tokenPair}
                initiateLimitOrderMethod={initiateLimitOrderMethod}
                tokenAInputQty={tokenAInputQty}
                tokenBInputQty={tokenBInputQty}
                isTokenAPrimary={isTokenAPrimary}
                limitRate={limitRate}
                newLimitOrderTransactionHash={newLimitOrderTransactionHash}
            />
        </Modal>
    ) : null;

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) >= parseFloat(tokenAInputQty);
    const loginButton = <Button title='Login' action={clickLogin} />;
    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const signer = provider?.getSigner();

    const approve = async (tokenAddress: string) => {
        // console.log(`allow button clicked for ${tokenAddress}`);
        setIsApprovalPending(true);
        let tx;
        try {
            tx = await approveToken(tokenAddress, signer);
        } catch (error) {
            setIsApprovalPending(false);
            setRecheckTokenAApproval(true);
        }
        if (tx.hash) {
            console.log('approval transaction hash: ' + tx.hash);
            // setApprovalButtonText('Approval Pending...');
            // dispatch(setCurrentTxHash(tx.hash));
            // dispatch(addPendingTx(tx.hash));
        }

        try {
            const receipt = await tx.wait();
            // console.log({ receipt });
            if (receipt) {
                // console.log('approval receipt: ' + JSON.stringify(receipt));
                // setShouldRecheckApproval(true);
                // parseSwapEthersTxReceipt(receipt).then((val) => {
                //   val.conversionRateString = `${val.sellSymbol} Approval Successful`;
                //   dispatch(addApprovalReceipt(val));
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
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            data-testid={'limit'}
        >
            <ContentContainer isOnTradeRoute>
                <LimitHeader tokenPair={tokenPair} isDenomBase={tradeData.isDenomBase} />
                <DenominationSwitch
                    tokenPair={tokenPair}
                    displayForBase={tradeData.isDenomBase}
                    poolPriceDisplay={poolPriceDisplay}
                    isTokenABase={isSellTokenBase}
                    didUserFlipDenom={tradeData.didUserFlipDenom}
                />
                <DividerDark />
                <LimitCurrencyConverter
                    tokenPair={tokenPair}
                    // poolPriceDisplay={poolPriceDisplay}
                    poolPriceNonDisplay={poolPriceNonDisplay}
                    isSellTokenBase={isSellTokenBase}
                    tokensBank={importedTokens}
                    chainId={chainId ?? '0x2a'}
                    setLimitAllowed={setLimitAllowed}
                    tokenABalance={truncateDecimals(parseFloat(tokenABalance), 4).toString()}
                    tokenBBalance={truncateDecimals(parseFloat(tokenBBalance), 4).toString()}
                    tokenAInputQty={tokenAInputQty}
                    tokenBInputQty={tokenBInputQty}
                    setTokenAInputQty={setTokenAInputQty}
                    isWithdrawToWalletChecked={isWithdrawToWalletChecked}
                    setTokenBInputQty={setTokenBInputQty}
                    setIsWithdrawToWalletChecked={setIsWithdrawToWalletChecked}
                    setLimitButtonErrorMessage={setLimitButtonErrorMessage}
                    isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                    setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                    limitRate={limitRate}
                    setLimitRate={setLimitRate}
                    insideTickDisplayPrice={insideTickDisplayPrice}
                    isDenominationInBase={tradeData.isDenomBase}
                />
                <LimitExtraInfo
                    tokenPair={tokenPair}
                    gasPriceinGwei={gasPriceinGwei}
                    poolPriceDisplay={poolPriceDisplay}
                    slippageTolerance={5}
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
                            limitAllowed={limitAllowed}
                            limitButtonErrorMessage={limitButtonErrorMessage}
                        />
                    )
                ) : (
                    loginButton
                )}
            </ContentContainer>
            {confirmLimitModalOrNull}
        </motion.section>
    );
}
