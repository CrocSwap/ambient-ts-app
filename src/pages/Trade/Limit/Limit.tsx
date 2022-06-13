// START: Import React and Dongles
import { useMoralis } from 'react-moralis';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import Button from '../../../components/Global/Button/Button';

import { approveToken, POOL_PRIMARY, contractAddresses, sendSwap } from '@crocswap-libs/sdk';

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

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

import truncateDecimals from '../../../utils/data/truncateDecimals';

// START: Import Local Files
// import { useTradeData } from '../Trade';
import { useModal } from '../../../components/Global/Modal/useModal';
import { TokenIF } from '../../../utils/interfaces/exports';

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
    poolPriceDisplay: number;
    tokenAAllowance: string;
    setRecheckTokenAApproval: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Limit(props: LimitPropsIF) {
    const {
        importedTokens,
        provider,
        isSellTokenBase,
        tokenABalance,
        tokenBBalance,
        tokenPair,
        gasPriceinGwei,
        poolPriceDisplay,
        tokenAAllowance,
        setRecheckTokenAApproval,
    } = props;
    // const { tradeData } = useTradeData();
    const { chainId, enableWeb3, isWeb3Enabled, authenticate, isAuthenticated } = useMoralis();
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

    useEffect(() => {
        console.log({ newLimitOrderTransactionHash });
    }, [newLimitOrderTransactionHash]);

    const tokenA = tokenPair.dataTokenA;
    const tokenB = tokenPair.dataTokenB;

    const { tradeData } = useAppSelector((state) => state);

    const isTokenAPrimary = tradeData.isTokenAPrimary;

    const [limitRate, setLimitRate] = useState<string>('');

    const initiateLimitOrderMethod = async () => {
        const sellTokenAddress = tokenA.address;
        const buyTokenAddress = tokenB.address;
        const poolId = POOL_PRIMARY;
        const slippageTolerancePercentage = 5;
        const sellTokenQty = tokenAInputQty;
        const buyTokenQty = tokenBInputQty;
        const qty = isTokenAPrimary ? sellTokenQty : buyTokenQty;

        console.log({ isTokenAPrimary });

        console.log({ limitRate });

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
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 0.6 } }}
            data-testid={'limit'}
        >
            <ContentContainer isOnTradeRoute>
                <LimitHeader tokenPair={tokenPair} />
                <DenominationSwitch tokenPair={tokenPair} />
                <DividerDark />
                <LimitCurrencyConverter
                    tokenPair={tokenPair}
                    poolPriceDisplay={poolPriceDisplay}
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
                    setLimitRate={setLimitRate}
                />
                <LimitExtraInfo
                    tokenPair={tokenPair}
                    gasPriceinGwei={gasPriceinGwei}
                    poolPriceDisplay={poolPriceDisplay}
                    slippageTolerance={5}
                    liquidityProviderFee={0.3}
                    quoteTokenIsBuy={true}
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
