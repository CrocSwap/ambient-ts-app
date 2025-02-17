import { toDisplayQty } from '@crocswap-libs/sdk';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { FaGasPump } from 'react-icons/fa';
import {
    ZERO_ADDRESS,
    checkBlacklist,
} from '../../../../ambient-utils/constants';
import {
    getFormattedNumber,
    waitForTransaction,
} from '../../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../../ambient-utils/types';
import useDebounce from '../../../../App/hooks/useDebounce';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { FlexContainer, Text } from '../../../../styled/Common';
import {
    GasPump,
    MaxButton,
    SVGContainer,
} from '../../../../styled/Components/Portfolio';
import Button from '../../../Form/Button';
import TransferAddressInput from './TransferAddressInput';

import {
    GAS_DROPS_ESTIMATE_TRANSFER_ERC20,
    GAS_DROPS_ESTIMATE_TRANSFER_NATIVE,
    NUM_GWEI_IN_WEI,
} from '../../../../ambient-utils/constants/';
import { AppStateContext } from '../../../../contexts';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import CurrencySelector from '../../../Form/CurrencySelector';

interface propsIF {
    selectedToken: TokenIF;
    tokenDexBalance: string;
    setRecheckTokenBalances: Dispatch<SetStateAction<boolean>>;
    sendToAddress: string | undefined;
    resolvedAddress: string | undefined;
    setSendToAddress: Dispatch<SetStateAction<string | undefined>>;
    secondaryEnsName: string | undefined;
    setTokenModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Transfer(props: propsIF) {
    const {
        selectedToken,
        tokenDexBalance,
        setRecheckTokenBalances,
        sendToAddress,
        resolvedAddress,
        setSendToAddress,
        secondaryEnsName,
        setTokenModalOpen,
    } = props;
    const { crocEnv, provider } = useContext(CrocEnvContext);
    const { userAddress } = useContext(UserDataContext);
    const {
        isUserOnline,
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const { gasPriceInGwei, isActiveNetworkL2, nativeTokenUsdPrice } =
        useContext(ChainDataContext);
    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);

    const selectedTokenDecimals = selectedToken.decimals;

    const tokenExchangeDepositsDisplay = useDebounce(
        tokenDexBalance
            ? toDisplayQty(tokenDexBalance, selectedTokenDecimals)
            : undefined,
        500,
    );

    const tokenExchangeDepositsDisplayNum = tokenExchangeDepositsDisplay
        ? parseFloat(tokenExchangeDepositsDisplay)
        : undefined;

    const tokenDexBalanceTruncated = getFormattedNumber({
        value: tokenExchangeDepositsDisplayNum,
    });

    const [transferQtyNonDisplay, setTransferQtyNonDisplay] = useState<
        string | undefined
    >();
    const [buttonMessage, setButtonMessage] = useState<string>('...');
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
    const [isCurrencyFieldDisabled, setIsCurrencyFieldDisabled] =
        useState<boolean>(true);
    const [isAddressFieldDisabled, setIsAddressFieldDisabled] =
        useState<boolean>(true);

    const [isAddressContract, setIsAddressContract] = useState<
        boolean | undefined
    >();

    useEffect(() => {
        if (!resolvedAddress) return;
        checkIfContract(resolvedAddress);
        async function checkIfContract(address: string) {
            const code = await provider?.getCode(address);
            setIsAddressContract(code !== '0x');
        }
    }, [resolvedAddress]);

    const isResolvedAddressValid = useMemo(() => {
        if (!resolvedAddress) return false;

        const isResolvedAddressBlacklisted = checkBlacklist(resolvedAddress);

        return (
            !isResolvedAddressBlacklisted &&
            !isAddressContract &&
            resolvedAddress?.length === 42 &&
            resolvedAddress.startsWith('0x') &&
            resolvedAddress !== ZERO_ADDRESS
        );
    }, [resolvedAddress, isAddressContract]);

    const isDexBalanceSufficient = useMemo(
        () =>
            tokenDexBalance && !!transferQtyNonDisplay
                ? BigInt(tokenDexBalance) >= BigInt(transferQtyNonDisplay)
                : false,
        [tokenDexBalance, transferQtyNonDisplay],
    );

    const isTransferQtyValid = useMemo(
        () => transferQtyNonDisplay !== undefined,
        [transferQtyNonDisplay],
    );

    const transferQtyNonDisplayNum = useMemo(
        () => parseFloat(transferQtyNonDisplay ?? ''),
        [transferQtyNonDisplay],
    );

    const [isTransferPending, setIsTransferPending] = useState(false);

    useEffect(() => {
        setIsTransferPending(false);
    }, [JSON.stringify(selectedToken)]);

    useEffect(() => {
        if (!isUserOnline) {
            setIsButtonDisabled(true);
            setButtonMessage('Currently Offline');
        } else if (isTransferPending) {
            setIsButtonDisabled(true);
            setIsAddressFieldDisabled(true);
            setIsCurrencyFieldDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Transfer Pending`);
        } else if (!isResolvedAddressValid) {
            setIsButtonDisabled(true);
            setIsAddressFieldDisabled(false);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Please Enter a Valid Address');
        } else if (!transferQtyNonDisplayNum) {
            // if num is undefined or 0
            setIsButtonDisabled(true);
            setIsAddressFieldDisabled(false);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Enter a Transfer Amount');
        } else if (transferQtyNonDisplayNum < 0) {
            setIsButtonDisabled(true);
            setIsAddressFieldDisabled(false);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Enter a Valid Transfer Amount');
        } else if (!isDexBalanceSufficient) {
            setIsButtonDisabled(true);
            setIsAddressFieldDisabled(false);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage(
                `${selectedToken.symbol} Exchange Balance Insufficient`,
            );
        } else if (isTransferQtyValid) {
            setIsButtonDisabled(false);
            setIsAddressFieldDisabled(false);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Transfer');
        }
    }, [
        isUserOnline,
        transferQtyNonDisplay,
        isTransferPending,
        isDexBalanceSufficient,
        isTransferQtyValid,
        selectedToken.symbol,
        isResolvedAddressValid,
    ]);

    const transfer = async (transferQty: string) => {
        if (crocEnv && transferQty && resolvedAddress) {
            try {
                const transferQtyDisplay = toDisplayQty(
                    transferQty,
                    selectedTokenDecimals,
                );

                setIsTransferPending(true);
                const tx = await crocEnv
                    .token(selectedToken.address)
                    .transfer(transferQtyDisplay, resolvedAddress);
                addPendingTx(tx?.hash);

                if (tx?.hash)
                    addTransactionByType({
                        chainId: chainId,
                        userAddress: userAddress || '',
                        txHash: tx.hash,
                        txType: 'Transfer',
                        txDescription: `Transfer ${selectedToken.symbol}`,
                    });
                if (tx) {
                    let receipt;
                    try {
                        receipt = await waitForTransaction(
                            provider,
                            tx.hash,
                            removePendingTx,
                            addPendingTx,
                            updateTransactionHash,
                        );
                    } catch (e) {
                        console.error({ e });
                    }

                    if (receipt) {
                        addReceipt(receipt);
                        removePendingTx(receipt.hash);
                        resetTransferQty();
                    }
                }
            } catch (error) {
                if (
                    error.reason === 'sending a transaction requires a signer'
                ) {
                    location.reload();
                }
                console.error({ error });
            } finally {
                setIsTransferPending(false);
                setRecheckTokenBalances(true);
            }
        }
    };

    const transferFn = async () => {
        if (transferQtyNonDisplay) await transfer(transferQtyNonDisplay);
    };

    const isResolvedAddressDifferent = resolvedAddress !== sendToAddress;

    const resolvedAddressOrNull = isResolvedAddressDifferent ? (
        <Text fontSize='body' color='text2'>
            Resolved Destination Address:
            <p style={{ userSelect: 'all' }}>{resolvedAddress}</p>
        </Text>
    ) : null;

    const secondaryEnsOrNull = secondaryEnsName ? (
        <Text fontSize='body' color='text2'>
            Destination ENS Address: {secondaryEnsName}
        </Text>
    ) : null;

    const resetTransferQty = () => {
        setTransferQtyNonDisplay(undefined);
        setInputValue('');
    };

    useEffect(() => {
        resetTransferQty();
    }, [selectedToken.address]);

    const isTokenDexBalanceGreaterThanZero = parseFloat(tokenDexBalance) > 0;

    const [inputValue, setInputValue] = useState('');

    const handleBalanceClick = () => {
        if (isTokenDexBalanceGreaterThanZero) {
            setTransferQtyNonDisplay(tokenDexBalance);

            if (tokenExchangeDepositsDisplay)
                setInputValue(tokenExchangeDepositsDisplay);
        }
    };

    const [extraL1GasFeeTransfer] = useState(isActiveNetworkL2 ? 0.01 : 0);

    const [transferGasPriceinDollars, setTransferGasPriceinDollars] = useState<
        string | undefined
    >();

    const isTokenEth = selectedToken.address === ZERO_ADDRESS;

    // calculate price of gas for exchange balance transfer
    useEffect(() => {
        if (gasPriceInGwei && nativeTokenUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                NUM_GWEI_IN_WEI *
                nativeTokenUsdPrice *
                (isTokenEth
                    ? GAS_DROPS_ESTIMATE_TRANSFER_NATIVE
                    : GAS_DROPS_ESTIMATE_TRANSFER_ERC20);

            setTransferGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum + extraL1GasFeeTransfer,
                    isUSD: true,
                }),
            );
        }
    }, [
        gasPriceInGwei,
        nativeTokenUsdPrice,
        isTokenEth,
        extraL1GasFeeTransfer,
    ]);

    return (
        <FlexContainer flexDirection='column' gap={16} padding={'16px'}>
            <Text fontSize='body' color='text2'>
                Transfer deposited collateral to another deposit account:
            </Text>
            <TransferAddressInput
                fieldId='exchange-balance-transfer-address'
                setTransferToAddress={setSendToAddress}
                sendToAddress={sendToAddress}
                disable={isAddressFieldDisabled}
            />
            <CurrencySelector
                selectedToken={selectedToken}
                setQty={setTransferQtyNonDisplay}
                inputValue={inputValue}
                setInputValue={setInputValue}
                disable={isCurrencyFieldDisabled}
                setTokenModalOpen={setTokenModalOpen}
            />
            <FlexContainer justifyContent='space-between' alignItems='center'>
                <FlexContainer fontSize='body' color='text2' gap={6}>
                    <Text color='text1'>Available:</Text>
                    {tokenDexBalanceTruncated || '...'}
                    {tokenDexBalance !== '0' && (
                        <MaxButton onClick={handleBalanceClick}>Max</MaxButton>
                    )}
                </FlexContainer>
                {
                    <GasPump>
                        <SVGContainer>
                            <FaGasPump size={12} />{' '}
                        </SVGContainer>
                        {transferGasPriceinDollars
                            ? transferGasPriceinDollars
                            : '…'}
                    </GasPump>
                }
            </FlexContainer>
            {resolvedAddressOrNull}
            {secondaryEnsOrNull}
            <Button
                idForDOM='transfer_tokens_button'
                style={{ textTransform: 'none', margin: '0 auto' }}
                title={buttonMessage}
                action={transferFn}
                disabled={isButtonDisabled}
                flat={true}
            />
        </FlexContainer>
    );
}
