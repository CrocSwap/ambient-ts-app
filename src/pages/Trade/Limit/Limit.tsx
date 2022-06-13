// START: Import React and Dongles
import { useMoralis } from 'react-moralis';
import { motion } from 'framer-motion';
import { useState } from 'react';

import Button from '../../../components/Global/Button/Button';

import { approveToken } from '@crocswap-libs/sdk';

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
    const { tradeData } = useTradeData();
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

    const confirmLimitModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Limit Confirmation'>
            <ConfirmLimitModal onClose={closeModal} tokenPair={tokenPair} />
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
                <DenominationSwitch
                    tokenPair={tokenPair}
                    displayForBase={tradeData.isDenomBase}
                    poolPriceDisplay={poolPriceDisplay}
                />
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
                />
                <LimitExtraInfo
                    tokenPair={tokenPair}
                    gasPriceinGwei={gasPriceinGwei}
                    poolPriceDisplay={poolPriceDisplay}
                    slippageTolerance={5}
                    liquidityProviderFee={0.3}
                    quoteTokenIsBuy={true}
                    displayForBase={tradeData.isDenomBase}
                    isTokenABase={isSellTokenBase}
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
