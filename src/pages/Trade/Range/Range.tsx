// START: Import React and Dongles
import { useState } from 'react';
import { useMoralis, useNewMoralisObject } from 'react-moralis';
import { motion } from 'framer-motion';
import { BigNumber } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
    sendAmbientMint,
    liquidityForBaseQty,
    fromDisplayQty,
    sendConcMint,
    parseMintEthersReceipt,
    EthersNativeReceipt,
    ambientPosSlot,
    tickToPrice,
    toDisplayPrice,
    concDepositSkew,
    GRID_SIZE_DFLT,
    MIN_TICK,
    MAX_TICK,
    concPosSlot,
    approveToken,
} from '@crocswap-libs/sdk';

// START: Import JSX Elements
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import RangeButton from '../../../components/Trade/Range/RangeButton/RangeButton';
import RangeCurrencyConverter from '../../../components/Trade/Range/RangeCurrencyConverter/RangeCurrencyConverter';
import RangePriceInfo from '../../../components/Trade/Range/RangePriceInfo/RangePriceInfo';
import RangeWidth from '../../../components/Trade/Range/RangeWidth/RangeWidth';
import RangeHeader from '../../../components/Trade/Range/RangeHeader/RangeHeader';
import DenominationSwitch from '../../../components/Swap/DenominationSwitch/DenominationSwitch';
import AdvancedModeToggle from '../../../components/Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import MinMaxPrice from '../../../components/Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import AdvancedPriceInfo from '../../../components/Trade/Range/AdvancedModeComponents/AdvancedPriceInfo/AdvancedPriceInfo';
import DividerDark from '../../../components/Global/DividerDark/DividerDark';
import Modal from '../../../components/Global/Modal/Modal';
import Button from '../../../components/Global/Button/Button';

// START: Import Local Files
import styles from './Range.module.css';
import { isTransactionReplacedError, TransactionError } from '../../../utils/TransactionError';
import { handleParsedReceipt } from '../../../utils/HandleParsedReceipt';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import ConfirmRangeModal from '../../../components/Trade/Range/ConfirmRangeModal/ConfirmRangeModal';
import { TokenIF } from '../../../utils/interfaces/exports';
import { useTradeData } from '../Trade';
import { useModal } from '../../../components/Global/Modal/useModal';

interface RangePropsIF {
    importedTokens: Array<TokenIF>;
    provider: JsonRpcProvider;
    gasPriceinGwei: string;
    lastBlockNumber: number;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    poolPriceDisplay: string;
    poolPriceNonDisplay: number;
    tokenABalance: string;
    tokenBBalance: string;
    tokenAAllowance: string;
    setRecheckTokenAApproval: React.Dispatch<React.SetStateAction<boolean>>;
    tokenBAllowance: string;
    setRecheckTokenBApproval: React.Dispatch<React.SetStateAction<boolean>>;
    didUserFlipDenom: boolean;
}

export default function Range(props: RangePropsIF) {
    const {
        importedTokens,
        provider,
        baseTokenAddress,
        quoteTokenAddress,
        poolPriceDisplay,
        poolPriceNonDisplay,
        tokenABalance,
        tokenBBalance,
        tokenAAllowance,
        setRecheckTokenAApproval,
        tokenBAllowance,
        setRecheckTokenBApproval,
        didUserFlipDenom
    } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const { save } = useNewMoralisObject('UserPosition');

    const [rangeWidthPercentage, setRangeWidthPercentage] = useState(100);

    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] = useState(false);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] = useState(false);
    const [newRangeTransactionHash, setNewRangeTransactionHash] = useState('');
    const {
        Moralis,
        user,
        account,
        chainId,
        isAuthenticated,
        isWeb3Enabled,
        authenticate,
        enableWeb3,
    } = useMoralis();

    const { tradeData } = useTradeData();

    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };

    const denominationsInBase = tradeData.isDenomBase;

    const isAmbient = rangeWidthPercentage === 100;

    const [rangeAllowed, setRangeAllowed] = useState<boolean>(false);

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');

    const isTokenABase = tokenPair?.dataTokenA.address === baseTokenAddress;

    const maxSlippage = 5;

    const poolWeiPriceLowLimit = poolPriceNonDisplay * (1 - maxSlippage / 100);
    const poolWeiPriceHighLimit = poolPriceNonDisplay * (1 + maxSlippage / 100);

    const signer = provider?.getSigner();

    const sendTransaction = async () => {
        const tokenAQty = (document.getElementById('A-range-quantity') as HTMLInputElement)?.value;
        let tokenAQtyNonDisplay: BigNumber;
        let liquidity: BigNumber;
        if (tokenAQty) {
            tokenAQtyNonDisplay = fromDisplayQty(tokenAQty, 18);
            liquidity = liquidityForBaseQty(poolPriceNonDisplay, tokenAQtyNonDisplay);
            if (signer) {
                let tx;
                if (isAmbient) {
                    console.log({ liquidity });
                    console.log({ poolWeiPriceLowLimit });
                    console.log({ poolWeiPriceHighLimit });
                    console.log({ tokenAQty });
                    tx = await sendAmbientMint(
                        baseTokenAddress,
                        quoteTokenAddress,
                        liquidity,
                        poolWeiPriceLowLimit,
                        poolWeiPriceHighLimit,
                        parseFloat(tokenAQty),
                        signer,
                    );
                } else {
                    const qtyIsBase = true;
                    tx = await sendConcMint(
                        baseTokenAddress,
                        quoteTokenAddress,
                        poolPriceNonDisplay,
                        roundedLowTick, // tickLower,
                        roundedHighTick, // tickHigher,
                        tokenAQty, //  primaryField === 'A' ? tokenAQtyString : tokenBQtyString,
                        qtyIsBase,
                        poolWeiPriceLowLimit,
                        poolWeiPriceHighLimit,
                        parseFloat(tokenAQty),
                        signer,
                    );
                }
                if (tx) {
                    let newTransactionHash = tx.hash;
                    setNewRangeTransactionHash(newRangeTransactionHash);
                    console.log({ newTransactionHash });
                    let parsedReceipt;

                    try {
                        const receipt = await tx.wait();
                        console.log({ receipt });
                        parsedReceipt = await parseMintEthersReceipt(
                            provider,
                            receipt as EthersNativeReceipt,
                        );
                    } catch (e) {
                        const error = e as TransactionError;
                        if (isTransactionReplacedError(error)) {
                            // The user used "speed up" or something similar
                            // in their client, but we now have the updated info

                            // dispatch(removePendingTx(tx.hash));
                            console.log('repriced');
                            newTransactionHash = error.replacement.hash;
                            console.log({ newTransactionHash });

                            parsedReceipt = await parseMintEthersReceipt(
                                provider,
                                error.receipt as EthersNativeReceipt,
                            );
                        }
                    } finally {
                        if (parsedReceipt)
                            handleParsedReceipt(Moralis, 'mint', newTransactionHash, parsedReceipt);
                        let posHash;
                        if (isAmbient) {
                            posHash = ambientPosSlot(
                                account as string,
                                baseTokenAddress,
                                quoteTokenAddress,
                            );
                        } else {
                            posHash = concPosSlot(
                                account as string,
                                baseTokenAddress,
                                quoteTokenAddress,
                                roundedLowTick,
                                roundedHighTick,
                            );
                        }
                        const txHash = newTransactionHash;

                        save({ txHash, posHash, user, account, chainId });
                    }
                }
            }
        }
    };

    // TODO:  @Emily refactor this fragment to use the same denomination switch
    // TODO:  ... component used in the Market and Limit modules
    const denominationSwitch = (
        <div className={styles.denomination_switch_container}>
            <AdvancedModeToggle advancedMode={tradeData.advancedMode} />
            <DenominationSwitch
                tokenPair={tokenPair}
                displayForBase={tradeData.isDenomBase}
                poolPriceDisplay={parseFloat(poolPriceDisplay)}
                isTokenABase={isTokenABase}
                didUserFlipDenom={didUserFlipDenom}
            />
        </div>
    );

    const advancedModeContent = (
        <>
            <MinMaxPrice />
            <AdvancedPriceInfo />
        </>
    );

    const [rangeButtonErrorMessage, setRangeButtonErrorMessage] =
        useState<string>('Enter an Amount');
    // useState<string>('');

    const currentPoolPriceTick = Math.log(poolPriceNonDisplay) / Math.log(1.0001);

    const rangeLowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
    const rangeHighTick = currentPoolPriceTick + rangeWidthPercentage * 100;

    const roundDownTick = (lowTick: number, nTicksGrid: number = GRID_SIZE_DFLT) => {
        const tickGrid = Math.floor(rangeLowTick / nTicksGrid) * nTicksGrid;
        const horizon = Math.floor(MIN_TICK / nTicksGrid) * nTicksGrid;
        return Math.max(tickGrid, horizon);
    };

    const roundedLowTick = roundDownTick(rangeLowTick);

    const roundUpTick = (highTick: number, nTicksGrid: number = GRID_SIZE_DFLT) => {
        const tickGrid = Math.ceil(highTick / nTicksGrid) * nTicksGrid;
        const horizon = Math.ceil(MAX_TICK / nTicksGrid) * nTicksGrid;
        return Math.min(tickGrid, horizon);
    };

    const roundedHighTick = roundUpTick(rangeHighTick);

    const rangeLowBoundNonDisplayPrice = tickToPrice(roundedLowTick);

    const rangeHighBoundNonDisplayPrice = tickToPrice(roundedHighTick);

    const rangeLowBoundDisplayPrice = toDisplayPrice(rangeLowBoundNonDisplayPrice, 18, 18, false);
    const rangeHighBoundDisplayPrice = toDisplayPrice(rangeHighBoundNonDisplayPrice, 18, 18, false);

    const depositSkew = concDepositSkew(
        poolPriceNonDisplay,
        rangeLowBoundNonDisplayPrice,
        rangeHighBoundNonDisplayPrice,
    );

    let maxPriceDisplay: string;

    if (isAmbient) {
        maxPriceDisplay = 'Infinity';
    } else {
        maxPriceDisplay = denominationsInBase
            ? truncateDecimals(rangeHighBoundDisplayPrice, 4).toString()
            : truncateDecimals(1 / rangeLowBoundDisplayPrice, 4).toString();
    }

    let minPriceDisplay: string;
    const apyPercentage: number = 100 - rangeWidthPercentage + 10;

    if (rangeWidthPercentage === 100) {
        minPriceDisplay = '0';
    } else {
        minPriceDisplay = denominationsInBase
            ? truncateDecimals(rangeLowBoundDisplayPrice, 4).toString()
            : truncateDecimals(1 / rangeHighBoundDisplayPrice, 4).toString();
    }

    const truncatedTokenABalance = truncateDecimals(parseFloat(tokenABalance), 4).toString();
    const truncatedTokenBBalance = truncateDecimals(parseFloat(tokenBBalance), 4).toString();

    // props for <RangePriceInfo/> React element
    const rangePriceInfoProps = {
        tokenPair: tokenPair,
        spotPriceDisplay: poolPriceDisplay,
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        apyPercentage: apyPercentage,
        isTokenABase: isTokenABase,
        isDenomBase: tradeData.isDenomBase,
    };
    // props for <ConfirmRangeModal/> React element
    const rangeModalProps = {
        tokenPair: tokenPair,
        spotPriceDisplay: poolPriceDisplay,
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        sendTransaction: sendTransaction,
        closeModal: closeModal,
        newRangeTransactionHash: newRangeTransactionHash,
        setNewRangeTransactionHash: setNewRangeTransactionHash,
    };

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencyConverterProps = {
        poolPriceNonDisplay: poolPriceNonDisplay,
        chainId: chainId ?? '0x2a',
        tokensBank: importedTokens,
        tokenPair: tokenPair,
        isAmbient: isAmbient,
        isTokenABase: isTokenABase,
        depositSkew: depositSkew,
        // isTokenAPrimary: isTokenAPrimary,
        // setIsTokenAPrimary: setIsTokenAPrimary,
        isWithdrawTokenAFromDexChecked: isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked: setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked: isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked: setIsWithdrawTokenBFromDexChecked,
        truncatedTokenABalance: truncatedTokenABalance,
        truncatedTokenBBalance: truncatedTokenBBalance,
        setTokenAInputQty: setTokenAInputQty,
        setTokenBInputQty: setTokenBInputQty,
        setRangeButtonErrorMessage: setRangeButtonErrorMessage,
        setRangeAllowed: setRangeAllowed,
    };

    // props for <RangeWidth/> React element
    const rangeWidthProps = {
        rangeWidthPercentage: rangeWidthPercentage,
        setRangeWidthPercentage: setRangeWidthPercentage,
    };

    const baseModeContent = (
        <>
            <RangeWidth {...rangeWidthProps} />
            <RangePriceInfo {...rangePriceInfoProps} />
        </>
    );
    const confirmSwapModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Range Confirmation'>
            <ConfirmRangeModal {...rangeModalProps} />
        </Modal>
    ) : null;

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

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) >= parseFloat(tokenAInputQty);
    const isTokenBAllowanceSufficient = parseFloat(tokenBAllowance) >= parseFloat(tokenBInputQty);

    const loginButton = <Button title='Login' action={clickLogin} />;

    const [isApprovalPending, setIsApprovalPending] = useState(false);

    const approve = async (tokenAddress: string) => {
        // console.log(`allow button clicked for ${tokenAddress}`);
        setIsApprovalPending(true);
        let tx;
        try {
            tx = await approveToken(tokenAddress, signer);
        } catch (error) {
            setIsApprovalPending(false);
            setRecheckTokenAApproval(true);
            setRecheckTokenBApproval(true);
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
            setRecheckTokenBApproval(true);
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

    // const isAmountEntered = parseFloat(tokenAInputQty) > 0 && parseFloat(tokenBInputQty) > 0;

    return (
        <motion.section
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 0.3 } }}
            data-testid={'range'}
        >
            <ContentContainer isOnTradeRoute>
                <RangeHeader tokenPair={tokenPair} />
                {denominationSwitch}
                <DividerDark />
                <RangeCurrencyConverter {...rangeCurrencyConverterProps} />
                {tradeData.advancedMode ? advancedModeContent : baseModeContent}
                {!isAuthenticated || !isWeb3Enabled ? (
                    loginButton
                ) : poolPriceNonDisplay !== 0 &&
                  parseFloat(tokenAInputQty) > 0 &&
                  !isTokenAAllowanceSufficient ? (
                    tokenAApprovalButton
                ) : poolPriceNonDisplay !== 0 &&
                  parseFloat(tokenBInputQty) > 0 &&
                  !isTokenBAllowanceSufficient ? (
                    tokenBApprovalButton
                ) : (
                    <RangeButton
                        onClickFn={openModal}
                        rangeAllowed={rangeAllowed}
                        rangeButtonErrorMessage={rangeButtonErrorMessage}
                    />
                )}
            </ContentContainer>

            {confirmSwapModalOrNull}
        </motion.section>
    );
}
