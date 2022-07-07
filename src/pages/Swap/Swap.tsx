// START: Import React and Dongles
import { useState, Dispatch, SetStateAction } from 'react';
import { useLocation } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import { motion } from 'framer-motion';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
    contractAddresses,
    POOL_PRIMARY,
    sendSwap,
    parseSwapEthersReceipt,
    EthersNativeReceipt,
    approveToken,
} from '@crocswap-libs/sdk';

// START: Import React Components
import CurrencyConverter from '../../components/Swap/CurrencyConverter/CurrencyConverter';
import ExtraInfo from '../../components/Swap/ExtraInfo/ExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import SwapHeader from '../../components/Swap/SwapHeader/SwapHeader';
import SwapButton from '../../components/Swap/SwapButton/SwapButton';
import DenominationSwitch from '../../components/Swap/DenominationSwitch/DenominationSwitch';
import DividerDark from '../../components/Global/DividerDark/DividerDark';
import Modal from '../../components/Global/Modal/Modal';
import RelativeModal from '../../components/Global/RelativeModal/RelativeModal';
import ConfirmSwapModal from '../../components/Swap/ConfirmSwapModal/ConfirmSwapModal';
import Button from '../../components/Global/Button/Button';

// START: Import Local Files
import styles from './Swap.module.css';
import { handleParsedReceipt } from '../../utils/HandleParsedReceipt';
import truncateDecimals from '../../utils/data/truncateDecimals';
import { isTransactionReplacedError, TransactionError } from '../../utils/TransactionError';
import { useTradeData } from '../Trade/Trade';
import { useAppSelector, useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../utils/interfaces/exports';
import { useModal } from '../../components/Global/Modal/useModal';
import { useRelativeModal } from '../../components/Global/RelativeModal/useRelativeModal';
import { addReceipt } from '../../utils/state/receiptDataSlice';

interface SwapPropsIF {
    importedTokens: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
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
    poolPriceDisplay: number;
    tokenAAllowance: string;
    setRecheckTokenAApproval: Dispatch<SetStateAction<boolean>>;
    chainId: string;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
}

export default function Swap(props: SwapPropsIF) {
    const {
        importedTokens,
        setImportedTokens,
        searchableTokens,
        provider,
        isOnTradeRoute,
        nativeBalance,
        gasPriceinGwei,
        tokenABalance,
        tokenBBalance,
        isSellTokenBase,
        tokenPair,
        poolPriceDisplay,
        tokenAAllowance,
        setRecheckTokenAApproval,
        chainId,

        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const [isRelativeModalOpen, closeRelativeModal] = useRelativeModal();

    const { Moralis, enableWeb3, isWeb3Enabled, authenticate, isAuthenticated } = useMoralis();
    // get URL pathway for user relative to index
    const { pathname } = useLocation();

    // use URL pathway to determine if user is in swap or market page
    // depending on location we pull data on the tx in progress differently
    const { tradeData } = pathname.includes('/trade')
        ? useTradeData()
        : useAppSelector((state) => state);

    const { navigationMenu } = pathname.includes('/trade')
        ? useTradeData()
        : { navigationMenu: null };

    const { tokenA, tokenB } = tradeData;

    const slippageTolerancePercentage = tradeData.slippageTolerance;

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
                await approve(tokenA.address);
            }}
        />
    );

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');

    const [swapAllowed, setSwapAllowed] = useState<boolean>(false);

    const [swapButtonErrorMessage, setSwapButtonErrorMessage] = useState<string>('');

    // const [isTokenAPrimary, setIsTokenAPrimary] = useState<boolean>(tradeData.isTokenAPrimary);
    const isTokenAPrimary = tradeData.isTokenAPrimary;
    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] = useState(false);
    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] = useState(false);

    const [newSwapTransactionHash, setNewSwapTransactionHash] = useState('');

    const signer = provider?.getSigner();

    // TODO:  @Emily refactor this function to remove sellTokenAddress
    // TODO:  ... and buyTokenAddress references
    async function initiateSwap() {
        const sellTokenAddress = tokenA.address;
        const buyTokenAddress = tokenB.address;
        const poolId = POOL_PRIMARY;
        const sellTokenQty = (document.getElementById('sell-quantity') as HTMLInputElement)?.value;
        const buyTokenQty = (document.getElementById('buy-quantity') as HTMLInputElement)?.value;
        const qty = isTokenAPrimary ? sellTokenQty : buyTokenQty;

        console.log({ isTokenAPrimary });

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

            let newTransactionHash = tx.hash;
            setNewSwapTransactionHash(newTransactionHash);
            let parsedReceipt;

            console.log({ newTransactionHash });

            try {
                const receipt = await tx.wait();
                console.log({ receipt });
                parsedReceipt = await parseSwapEthersReceipt(
                    provider,
                    receipt as EthersNativeReceipt,
                );
            } catch (e) {
                const error = e as TransactionError;
                if (isTransactionReplacedError(error)) {
                    // The user used "speed up" or something similar
                    // in their client, but we now have the updated info
                    console.log('repriced');
                    newTransactionHash = error.replacement.hash;
                    console.log({ newTransactionHash });
                    parsedReceipt = await parseSwapEthersReceipt(
                        provider,
                        error.receipt as EthersNativeReceipt,
                    );
                }
            }
            if (parsedReceipt) {
                const unifiedReceipt = await handleParsedReceipt(
                    Moralis,
                    'swap',
                    newTransactionHash,
                    parsedReceipt,
                );
                if (unifiedReceipt) {
                    dispatch(addReceipt(unifiedReceipt));
                    console.log({ unifiedReceipt });
                }
            }
        }
    }

    // TODO:  @Emily refactor this Modal and later elements such that
    // TODO:  ... tradeData is passed to directly instead of tokenPair
    const confirmSwapModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Swap Confirmation'>
            <ConfirmSwapModal
                tokenPair={{ dataTokenA: tokenA, dataTokenB: tokenB }}
                initiateSwapMethod={initiateSwap}
                onClose={closeModal}
                newSwapTransactionHash={newSwapTransactionHash}
                setNewSwapTransactionHash={setNewSwapTransactionHash}
            />
        </Modal>
    ) : null;

    const relativeModalOrNull = isRelativeModalOpen ? (
        <RelativeModal onClose={closeRelativeModal} title='Relative Modal'>
            You are about to do something that will lose you a lot of money. If you think you are
            smarter than the awesome team that programmed this, press dismiss.
        </RelativeModal>
    ) : null;

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) >= parseFloat(tokenAInputQty);

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            data-testid={'swap'}
            className={styles.swap}
        >
            <ContentContainer isOnTradeRoute={isOnTradeRoute}>
                <SwapHeader
                    tokenPair={{ dataTokenA: tokenA, dataTokenB: tokenB }}
                    isOnTradeRoute={isOnTradeRoute}
                    isDenomBase={tradeData.isDenomBase}
                    isTokenABase={isSellTokenBase}
                />
                <DividerDark addMarginTop />
                {navigationMenu}
                <CurrencyConverter
                    tokenPair={tokenPair}
                    tokensBank={importedTokens}
                    setImportedTokens={setImportedTokens}
                    searchableTokens={searchableTokens}
                    chainId={chainId as string}
                    isLiq={false}
                    poolPriceDisplay={poolPriceDisplay}
                    isTokenAPrimary={isTokenAPrimary}
                    isSellTokenBase={isSellTokenBase}
                    nativeBalance={truncateDecimals(parseFloat(nativeBalance), 4).toString()}
                    tokenABalance={truncateDecimals(parseFloat(tokenABalance), 4).toString()}
                    tokenBBalance={truncateDecimals(parseFloat(tokenBBalance), 4).toString()}
                    tokenAInputQty={tokenAInputQty}
                    tokenBInputQty={tokenBInputQty}
                    setTokenAInputQty={setTokenAInputQty}
                    setTokenBInputQty={setTokenBInputQty}
                    isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                    setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                    isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                    setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                    setSwapAllowed={setSwapAllowed}
                    setSwapButtonErrorMessage={setSwapButtonErrorMessage}
                    activeTokenListsChanged={activeTokenListsChanged}
                    indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
                />
                <div className={styles.header_container}>
                    <DividerDark addMarginTop />
                    <DenominationSwitch
                        tokenPair={{ dataTokenA: tokenA, dataTokenB: tokenB }}
                        isTokenABase={isSellTokenBase}
                        displayForBase={tradeData.isDenomBase}
                        poolPriceDisplay={poolPriceDisplay}
                        didUserFlipDenom={tradeData.didUserFlipDenom}
                    />
                </div>
                <ExtraInfo
                    tokenPair={{ dataTokenA: tokenA, dataTokenB: tokenB }}
                    isTokenABase={isSellTokenBase}
                    poolPriceDisplay={poolPriceDisplay}
                    slippageTolerance={slippageTolerancePercentage}
                    liquidityProviderFee={0.3}
                    quoteTokenIsBuy={true}
                    gasPriceinGwei={gasPriceinGwei}
                    didUserFlipDenom={tradeData.didUserFlipDenom}
                    isDenomBase={tradeData.isDenomBase}
                />
                {isAuthenticated && isWeb3Enabled ? (
                    !isTokenAAllowanceSufficient && parseFloat(tokenAInputQty) > 0 ? (
                        approvalButton
                    ) : (
                        <SwapButton
                            onClickFn={openModal}
                            swapAllowed={swapAllowed}
                            swapButtonErrorMessage={swapButtonErrorMessage}
                        />
                    )
                ) : (
                    loginButton
                )}
            </ContentContainer>
            {confirmSwapModalOrNull}
            {relativeModalOrNull}
            {/* <div className={styles.footer}>
            <PageFooter lastBlockNumber={2}/>

            </div> */}
        </motion.main>
    );
}
