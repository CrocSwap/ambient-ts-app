// START: Import React and Dongles
import { useState } from 'react';
import { useMoralis } from 'react-moralis';
import { motion } from 'framer-motion';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
    contractAddresses,
    POOL_PRIMARY,
    sendSwap,
    parseSwapEthersReceipt,
    EthersNativeReceipt,
} from '@crocswap-libs/sdk';

import { TokenIF } from '../../utils/interfaces/TokenIF';

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
import { getCurrentTokens } from '../../utils/functions/processTokens';
import { useModal } from '../../components/Global/Modal/useModal';
import { useRelativeModal } from '../../components/Global/RelativeModal/useRelativeModal';
// import { useAppSelector } from '../../utils/hooks/reduxToolkit';

interface ISwapProps {
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
}

export default function Swap(props: ISwapProps) {
    const {
        provider,
        isOnTradeRoute,
        nativeBalance,
        tokenABalance,
        tokenBBalance,
        isSellTokenBase,
        gasPriceinGwei,
        tokenPair,
        poolPriceDisplay,
    } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const [isRelativeModalOpen, closeRelativeModal] = useRelativeModal();

    const { Moralis, chainId, enableWeb3, isWeb3Enabled, authenticate, isAuthenticated } =
        useMoralis();
    // get URL pathway for user relative to index

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

    // get current tokens for the active chain
    // if called before Moralis can initialize use kovan
    const tokensBank = getCurrentTokens(chainId ?? '0x2a');

    const [tokenAInputQty, setTokenAInputQty] = useState<string>('');
    const [tokenBInputQty, setTokenBInputQty] = useState<string>('');

    const [swapAllowed, setSwapAllowed] = useState<boolean>(false);

    const [isTokenAPrimary, setIsTokenAPrimary] = useState<boolean>(true);

    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] = useState(false);
    const [isWithdrawToWalletChecked, setIsWithdrawToWalletChecked] = useState(true);

    const [newSwapTransactionHash, setNewSwapTransactionHash] = useState('');

    const signer = provider?.getSigner();

    async function initiateSwap() {
        // const sellTokenAddress = contractAddresses.ZERO_ADDR;
        const sellTokenAddress = tokenPair.dataTokenA.address;
        const buyTokenAddress = tokenPair.dataTokenB.address;
        // const buyTokenAddress = daiKovanAddress;
        const poolId = POOL_PRIMARY;
        const slippageTolerancePercentage = 5;
        const sellTokenQty = (document.getElementById('sell-quantity') as HTMLInputElement)?.value;
        const buyTokenQty = (document.getElementById('buy-quantity') as HTMLInputElement)?.value;
        const qty = isTokenAPrimary ? sellTokenQty : buyTokenQty;

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
            if (parsedReceipt)
                handleParsedReceipt(Moralis, 'swap', newTransactionHash, parsedReceipt);
        }
    }

    const confirmSwapModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Swap Confirmation'>
            <ConfirmSwapModal
                tokenPair={tokenPair}
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

    return (
        <motion.main
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 0.7 } }}
            data-testid={'swap'}
            className={styles.swap}
        >
            <ContentContainer isOnTradeRoute={isOnTradeRoute}>
                <SwapHeader tokenPair={tokenPair} isOnTradeRoute={isOnTradeRoute} />
                <DenominationSwitch tokenPair={tokenPair} />
                <DividerDark />
                <CurrencyConverter
                    tokenPair={tokenPair}
                    tokensBank={tokensBank}
                    chainId={chainId as string}
                    isLiq={false}
                    poolPriceDisplay={poolPriceDisplay}
                    isTokenAPrimary={isTokenAPrimary}
                    setIsTokenAPrimary={setIsTokenAPrimary}
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
                    isWithdrawToWalletChecked={isWithdrawToWalletChecked}
                    setIsWithdrawToWalletChecked={setIsWithdrawToWalletChecked}
                    setSwapAllowed={setSwapAllowed}
                />
                <ExtraInfo
                    tokenPair={tokenPair}
                    poolPriceDisplay={poolPriceDisplay}
                    slippageTolerance={5}
                    liquidityProviderFee={0.3}
                    quoteTokenIsBuy={true}
                    gasPriceinGwei={gasPriceinGwei}
                />
                {isAuthenticated && isWeb3Enabled ? (
                    <SwapButton onClickFn={openModal} swapAllowed={swapAllowed} />
                ) : (
                    loginButton
                )}
            </ContentContainer>

            {confirmSwapModalOrNull}
            {relativeModalOrNull}
            {/* <button onClick={openRelativeModal}>open relative modal</button> */}
        </motion.main>
    );
}
