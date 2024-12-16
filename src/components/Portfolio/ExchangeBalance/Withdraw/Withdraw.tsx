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
    IS_LOCAL_ENV,
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
import {
    TransactionError,
    isTransactionFailedError,
    isTransactionReplacedError,
} from '../../../../utils/TransactionError';

import {
    GAS_DROPS_ESTIMATE_WITHDRAWAL_ERC20,
    GAS_DROPS_ESTIMATE_WITHDRAWAL_NATIVE,
    NUM_GWEI_IN_WEI,
} from '../../../../ambient-utils/constants/';
import { AppStateContext } from '../../../../contexts';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import Button from '../../../Form/Button';
import CurrencySelector from '../../../Form/CurrencySelector';
import Toggle from '../../../Form/Toggle';
import SmolRefuelLink from '../../../Global/SmolRefuelLink/SmolRefuelLink';
import TransferAddressInput from '../Transfer/TransferAddressInput';

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

export default function Withdraw(props: propsIF) {
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
    const { crocEnv, ethMainnetUsdPrice, provider } =
        useContext(CrocEnvContext);
    const {
        isUserOnline,
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { gasPriceInGwei, isActiveNetworkBlast, isActiveNetworkScroll } =
        useContext(ChainDataContext);

    const { userAddress } = useContext(UserDataContext);

    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);

    const selectedTokenDecimals = selectedToken.decimals;

    const isTokenDexBalanceGreaterThanZero = parseFloat(tokenDexBalance) > 0;

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

    const [withdrawQtyNonDisplay, setWithdrawQtyNonDisplay] = useState<
        string | undefined
    >();
    const [buttonMessage, setButtonMessage] = useState<string>('...');
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
    const [isCurrencyFieldDisabled, setIsCurrencyFieldDisabled] =
        useState<boolean>(true);

    const [isSendToAddressChecked, setIsSendToAddressChecked] =
        useState<boolean>(false);

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
            tokenDexBalance && !!withdrawQtyNonDisplay
                ? BigInt(tokenDexBalance) >= BigInt(withdrawQtyNonDisplay)
                : false,
        [tokenDexBalance, withdrawQtyNonDisplay],
    );

    const isWithdrawQtyValid = useMemo(
        () => withdrawQtyNonDisplay !== undefined,
        [withdrawQtyNonDisplay],
    );

    const withdrawQtyNonDisplayNum = useMemo(
        () => parseFloat(withdrawQtyNonDisplay ?? ''),
        [withdrawQtyNonDisplay],
    );

    const [isWithdrawPending, setIsWithdrawPending] = useState(false);

    useEffect(() => {
        setIsWithdrawPending(false);
    }, [JSON.stringify(selectedToken)]);

    useEffect(() => {
        if (!isUserOnline) {
            setIsButtonDisabled(true);
            setButtonMessage('Currently Offline');
        } else if (isWithdrawPending) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Withdrawal Pending`);
        } else if (isSendToAddressChecked && !isResolvedAddressValid) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Please Enter a Valid Address');
        } else if (!withdrawQtyNonDisplayNum) {
            // if num is undefined or 0
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Enter a Withdrawal Amount');
        } else if (withdrawQtyNonDisplayNum < 0) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Enter a Valid Withdrawal Amount');
        } else if (!isDexBalanceSufficient) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage(
                `${selectedToken.symbol} Exchange Balance Insufficient`,
            );
        } else if (isWithdrawQtyValid) {
            setIsButtonDisabled(false);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Withdraw');
        }
    }, [
        isUserOnline,
        withdrawQtyNonDisplay,
        isWithdrawPending,
        isDexBalanceSufficient,
        isWithdrawQtyValid,
        selectedToken.symbol,
        isResolvedAddressValid,
        isSendToAddressChecked,
    ]);

    const withdraw = async (withdrawQtyNonDisplay: string) => {
        if (crocEnv && withdrawQtyNonDisplay && userAddress) {
            try {
                const depositQtyDisplay = toDisplayQty(
                    withdrawQtyNonDisplay,
                    selectedTokenDecimals,
                );

                setIsWithdrawPending(true);
                let tx;
                if (isSendToAddressChecked && resolvedAddress) {
                    tx = await crocEnv
                        .token(selectedToken.address)
                        .withdraw(depositQtyDisplay, resolvedAddress);
                } else {
                    tx = await crocEnv
                        .token(selectedToken.address)
                        .withdraw(depositQtyDisplay, userAddress);
                }
                addPendingTx(tx?.hash);
                if (tx?.hash)
                    addTransactionByType({
                        chainId: chainId,
                        userAddress: userAddress || '',
                        txHash: tx.hash,
                        txType: 'Withdraw',
                        txDescription: `Withdrawal of ${selectedToken.symbol}`,
                    });

                if (tx) {
                    let receipt;
                    try {
                        receipt = await waitForTransaction(
                            provider,
                            tx.hash,
                            1,
                        );
                    } catch (e) {
                        const error = e as TransactionError;
                        console.error({ error });
                        // The user used "speed up" or something similar
                        // in their client, but we now have the updated info
                        if (isTransactionReplacedError(error)) {
                            IS_LOCAL_ENV && console.debug('repriced');
                            removePendingTx(error.hash);

                            const newTransactionHash = error.replacement.hash;
                            addPendingTx(newTransactionHash);

                            updateTransactionHash(
                                error.hash,
                                error.replacement.hash,
                            );
                            IS_LOCAL_ENV &&
                                console.debug({ newTransactionHash });
                            receipt = error.receipt;
                        } else if (isTransactionFailedError(error)) {
                            console.error({ error });
                            receipt = error.receipt;
                        }
                    }

                    if (receipt) {
                        addReceipt(receipt);
                        removePendingTx(receipt.hash);
                        resetWithdrawQty();
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
                setIsWithdrawPending(false);
                setRecheckTokenBalances(true);
            }
        }
    };

    const resetWithdrawQty = () => {
        setWithdrawQtyNonDisplay(undefined);
        setInputValue('');
    };

    useEffect(() => {
        resetWithdrawQty();
    }, [selectedToken.address]);

    const withdrawFn = async () => {
        if (withdrawQtyNonDisplay) await withdraw(withdrawQtyNonDisplay);
    };

    const transferAddressOrNull = isSendToAddressChecked ? (
        <TransferAddressInput
            fieldId='exchange-balance-withdraw-address'
            setTransferToAddress={setSendToAddress}
            sendToAddress={sendToAddress}
            disable={isWithdrawPending}
        />
    ) : null;

    const isResolvedAddressDifferent = resolvedAddress !== sendToAddress;

    const resolvedAddressOrNull =
        isSendToAddressChecked &&
        isResolvedAddressValid &&
        isResolvedAddressDifferent ? (
            <Text fontSize='body' color='text2'>
                Resolved Destination Address:
                <p style={{ userSelect: 'all' }}>{resolvedAddress}</p>
            </Text>
        ) : null;

    const secondaryEnsOrNull =
        isSendToAddressChecked && secondaryEnsName ? (
            <Text fontSize='body' color='text2'>
                Destination ENS Address: {secondaryEnsName}
            </Text>
        ) : null;

    const toggleContent = (
        <FlexContainer
            justifyContent='flex-start'
            alignItems='center'
            fontSize='body'
            color='text2'
        >
            <div style={{ marginRight: '10px' }}>
                <Toggle
                    isOn={isSendToAddressChecked}
                    handleToggle={() =>
                        setIsSendToAddressChecked(!isSendToAddressChecked)
                    }
                    Width={36}
                    id='withdraw_to_different_address'
                    disabled={isWithdrawPending}
                />
            </div>
            Send to a different address
        </FlexContainer>
    );

    const [inputValue, setInputValue] = useState('');

    const handleBalanceClick = () => {
        if (isTokenDexBalanceGreaterThanZero) {
            setWithdrawQtyNonDisplay(tokenDexBalance);
            if (tokenExchangeDepositsDisplay)
                setInputValue(tokenExchangeDepositsDisplay);
        }
    };
    const [extraL1GasFeeWithdraw] = useState(
        isActiveNetworkScroll ? 0.01 : isActiveNetworkBlast ? 0.01 : 0,
    );

    const [withdrawGasPriceinDollars, setWithdrawGasPriceinDollars] = useState<
        string | undefined
    >();

    const isTokenEth = selectedToken.address === ZERO_ADDRESS;

    // calculate price of gas for withdrawal
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                Number(NUM_GWEI_IN_WEI) *
                ethMainnetUsdPrice *
                Number(
                    isTokenEth
                        ? GAS_DROPS_ESTIMATE_WITHDRAWAL_NATIVE
                        : GAS_DROPS_ESTIMATE_WITHDRAWAL_ERC20,
                );

            setWithdrawGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum + extraL1GasFeeWithdraw,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice, isTokenEth, extraL1GasFeeWithdraw]);

    return (
        <FlexContainer flexDirection='column' gap={16} padding={'16px'}>
            <Text fontSize='body' color='text2'>
                Withdraw tokens from the exchange to your wallet:
            </Text>
            {toggleContent}
            {transferAddressOrNull}
            <CurrencySelector
                selectedToken={selectedToken}
                setQty={setWithdrawQtyNonDisplay}
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
                        {withdrawGasPriceinDollars
                            ? withdrawGasPriceinDollars
                            : '…'}
                    </GasPump>
                }
            </FlexContainer>
            <SmolRefuelLink />
            {resolvedAddressOrNull}
            {secondaryEnsOrNull}
            <Button
                idForDOM='withdraw_tokens_button'
                style={{ textTransform: 'none', margin: '0 auto' }}
                title={buttonMessage}
                action={withdrawFn}
                disabled={isButtonDisabled}
                flat={true}
            />
        </FlexContainer>
    );
}
