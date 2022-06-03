// START: Import React and Dongles
import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
    contractAddresses,
    getSpotPrice,
    getSpotPriceDisplay,
    POOL_PRIMARY,
    sendSwap,
    parseSwapEthersReceipt,
    EthersNativeReceipt,
    getTokenBalanceDisplay,
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
import ConfirmSwapModal from '../../components/Swap/ConfirmSwapModal/ConfirmSwapModal';
import Button from '../../components/Global/Button/Button';

// START: Import Local Files
import styles from './Swap.module.css';
import { handleParsedReceipt } from '../../utils/HandleParsedReceipt';
import truncateDecimals from '../../utils/data/truncateDecimals';
import { isTransactionReplacedError, TransactionError } from '../../utils/TransactionError';
import { getCurrentTokens, findTokenByAddress } from '../../utils/functions/processTokens';
import { kovanETH, kovanUSDC } from '../../utils/data/defaultTokens';
import { useModal } from '../../components/Global/Modal/useModal';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { useTradeData } from '../Trade/Trade';

interface ISwapProps {
    provider: JsonRpcProvider;
    isOnTradeRoute?: boolean;
    gasPriceinGwei: string;
    nativeBalance: string;
    lastBlockNumber: number;
}

export default function Swap(props: ISwapProps) {
    const { provider, isOnTradeRoute, lastBlockNumber, nativeBalance, gasPriceinGwei } = props;
    const [isModalOpen, openModal, closeModal] = useModal();
    const { Moralis, chainId, enableWeb3, isWeb3Enabled, authenticate, isAuthenticated, account } =
        useMoralis();
    // get URL pathway for user relative to index
    const { pathname } = useLocation();

    // use URL pathway to determine if user is in swap or market page
    // depending on location we pull data on the tx in progress differently
    const tradeData = pathname.includes('/trade')
        ? useTradeData().tradeData
        : useAppSelector((state) => state.tradeData);

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

    const tokenPair = {
        dataTokenA: findTokenByAddress(tradeData.addressTokenA, tokensBank) ?? kovanETH,
        dataTokenB: findTokenByAddress(tradeData.addressTokenB, tokensBank) ?? kovanUSDC,
    };

    const [tokenABalance, setTokenABalance] = useState<string>('');
    const [tokenBBalance, setTokenBBalance] = useState<string>('');

    // useEffect to update selected token balances
    useEffect(() => {
        (async () => {
            if (
                provider &&
                account
                // && isAuthenticated && provider.connection?.url === 'metamask'
            ) {
                const signer = provider.getSigner();
                const tokenABal = await getTokenBalanceDisplay(
                    tokenPair.dataTokenA.address,
                    account,
                    signer,
                );
                // make sure a balance was returned, initialized as null
                if (tokenABal) {
                    // send value to local state
                    setTokenABalance(tokenABal);
                }
                const tokenBBal = await getTokenBalanceDisplay(
                    tokenPair.dataTokenB.address,
                    account,
                    signer,
                );
                // make sure a balance was returned, initialized as null
                if (tokenBBal) {
                    // send value to local state
                    setTokenBBalance(tokenBBal);
                }
            }
        })();
    }, [chainId, account, isWeb3Enabled, isAuthenticated, tokenPair, lastBlockNumber]);

    const [swapAllowed, setSwapAllowed] = useState<boolean>(false);

    const [isSellTokenPrimary, setIsSellTokenPrimary] = useState<boolean>(true);

    const [isWithdrawFromDexChecked, setIsWithdrawFromDexChecked] = useState(false);
    const [isWithdrawToWalletChecked, setIsWithdrawToWalletChecked] = useState(true);

    const daiKovanAddress = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';

    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState(0);
    const [newSwapTransactionHash, setNewSwapTransactionHash] = useState('');

    useEffect(() => {
        (async () => {
            const spotPrice = await getSpotPrice(
                contractAddresses.ZERO_ADDR,
                daiKovanAddress,
                POOL_PRIMARY,
                provider,
            );
            if (poolPriceNonDisplay !== spotPrice) {
                setPoolPriceNonDisplay(spotPrice);
            }
        })();
    }, [lastBlockNumber]);

    const [poolPriceDisplay, setPoolPriceDisplay] = useState(0);

    useEffect(() => {
        (async () => {
            const spotPriceDisplay = await getSpotPriceDisplay(
                contractAddresses.ZERO_ADDR,
                daiKovanAddress,
                POOL_PRIMARY,
                provider,
            );
            if (poolPriceDisplay !== spotPriceDisplay) {
                setPoolPriceDisplay(spotPriceDisplay);
            }
        })();
    }, [lastBlockNumber]);

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
        const qty = isSellTokenPrimary ? sellTokenQty : buyTokenQty;

        // overwritten by a non-zero value when selling ETH for another token
        let ethValue = '0';

        // if the user is selling ETH and requesting an exact output quantity
        // then pad the ETH sent to the contract by 2% (remainder will be returned)
        if (sellTokenAddress === contractAddresses.ZERO_ADDR) {
            const roundedUpEthValue = truncateDecimals(
                parseFloat(sellTokenQty) * 1.02,
                18,
            ).toString();
            isSellTokenPrimary ? (ethValue = sellTokenQty) : (ethValue = roundedUpEthValue);
        }

        if (signer) {
            const tx = await sendSwap(
                sellTokenAddress,
                buyTokenAddress,
                isSellTokenPrimary,
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
                    chainId={chainId as string}
                    isLiq={false}
                    poolPrice={poolPriceNonDisplay}
                    setIsSellTokenPrimary={setIsSellTokenPrimary}
                    nativeBalance={truncateDecimals(parseFloat(nativeBalance), 4).toString()}
                    tokenABalance={truncateDecimals(parseFloat(tokenABalance), 4).toString()}
                    tokenBBalance={truncateDecimals(parseFloat(tokenBBalance), 4).toString()}
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
        </motion.main>
    );
}
