import { toDisplayQty } from '@crocswap-libs/sdk';
import { TokenIF } from '../../../../utils/interfaces/exports';
import styles from './Withdraw.module.css';
import WithdrawButton from './WithdrawButton/WithdrawButton';
import WithdrawCurrencySelector from './WithdrawCurrencySelector/WithdrawCurrencySelector';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import TransferAddressInput from '../Transfer/TransferAddressInput/TransferAddressInput';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
    updateTransactionHash,
} from '../../../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../../utils/TransactionError';
import { BigNumber } from 'ethers';
import { checkBlacklist } from '../../../../utils/data/blacklist';
import { FaGasPump } from 'react-icons/fa';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../constants';
import useDebounce from '../../../../App/hooks/useDebounce';
import Toggle from '../../../Global/Toggle/Toggle';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';

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
    const { crocEnv, ethMainnetUsdPrice } = useContext(CrocEnvContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);

    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

    const dispatch = useAppDispatch();

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

    const isResolvedAddressValid = useMemo(() => {
        if (!resolvedAddress) return false;

        const isResolvedAddressBlacklisted = checkBlacklist(resolvedAddress);

        return (
            !isResolvedAddressBlacklisted &&
            resolvedAddress?.length === 42 &&
            resolvedAddress.startsWith('0x')
        );
    }, [resolvedAddress]);

    const isDexBalanceSufficient = useMemo(
        () =>
            tokenDexBalance && !!withdrawQtyNonDisplay
                ? BigNumber.from(tokenDexBalance).gte(
                      BigNumber.from(withdrawQtyNonDisplay),
                  )
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
        if (isWithdrawPending) {
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
                dispatch(addPendingTx(tx?.hash));
                if (tx?.hash)
                    dispatch(
                        addTransactionByType({
                            txHash: tx.hash,
                            txType: 'Withdraw',
                            txDescription: `Withdrawal of ${selectedToken.symbol}`,
                        }),
                    );

                let receipt;
                try {
                    if (tx) receipt = await tx.wait();
                } catch (e) {
                    const error = e as TransactionError;
                    console.error({ error });
                    // The user used "speed up" or something similar
                    // in their client, but we now have the updated info
                    if (isTransactionReplacedError(error)) {
                        IS_LOCAL_ENV && console.debug('repriced');
                        dispatch(removePendingTx(error.hash));

                        const newTransactionHash = error.replacement.hash;
                        dispatch(addPendingTx(newTransactionHash));

                        dispatch(
                            updateTransactionHash({
                                oldHash: error.hash,
                                newHash: error.replacement.hash,
                            }),
                        );
                        IS_LOCAL_ENV && console.debug({ newTransactionHash });
                        receipt = error.receipt;
                    } else if (isTransactionFailedError(error)) {
                        console.error({ error });
                        receipt = error.receipt;
                    }
                }

                if (receipt) {
                    dispatch(addReceipt(JSON.stringify(receipt)));
                    dispatch(removePendingTx(receipt.transactionHash));
                    resetWithdrawQty();
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
            <div className={styles.info_text_non_clickable}>
                Resolved Destination Address:
                <div className={styles.hex_address}>{resolvedAddress}</div>
            </div>
        ) : null;

    const secondaryEnsOrNull =
        isSendToAddressChecked && secondaryEnsName ? (
            <div className={styles.info_text_non_clickable}>
                Destination ENS Address: {secondaryEnsName}
            </div>
        ) : null;

    const toggleContent = (
        <span className={styles.surplus_toggle}>
            <div className={styles.toggle_container}>
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
        </span>
    );

    const [inputValue, setInputValue] = useState('');

    const handleBalanceClick = () => {
        if (isTokenDexBalanceGreaterThanZero) {
            setWithdrawQtyNonDisplay(tokenDexBalance);
            if (tokenExchangeDepositsDisplay)
                setInputValue(tokenExchangeDepositsDisplay);
        }
    };

    const [withdrawGasPriceinDollars, setWithdrawGasPriceinDollars] = useState<
        string | undefined
    >();

    const isTokenEth = selectedToken.address === ZERO_ADDRESS;

    const averageGasUnitsForEthWithdrawalInGasDrops = 48000;
    const averageGasUnitsForErc20WithdrawalInGasDrops = 60000;
    const gweiInWei = 1e-9;

    // calculate price of gas for withdrawal
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                gweiInWei *
                ethMainnetUsdPrice *
                (isTokenEth
                    ? averageGasUnitsForEthWithdrawalInGasDrops
                    : averageGasUnitsForErc20WithdrawalInGasDrops);

            setWithdrawGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice, isTokenEth]);

    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text_non_clickable}>
                Withdraw tokens from the exchange to your wallet
            </div>
            {toggleContent}
            {transferAddressOrNull}
            <WithdrawCurrencySelector
                selectedToken={selectedToken}
                setWithdrawQty={setWithdrawQtyNonDisplay}
                inputValue={inputValue}
                setInputValue={setInputValue}
                disable={isCurrencyFieldDisabled}
                setTokenModalOpen={setTokenModalOpen}
            />
            <div className={styles.additional_info}>
                <div
                    className={`${styles.available_container} ${styles.info_text_non_clickable}`}
                >
                    <div className={styles.available_text}>Available:</div>
                    {tokenDexBalanceTruncated || '...'}
                    <button
                        className={`${styles.max_button} ${
                            tokenDexBalance !== '0' && styles.max_button_enabled
                        }`}
                        onClick={handleBalanceClick}
                        disabled={tokenDexBalance === '0'}
                    >
                        Max
                    </button>
                </div>
                <div className={styles.gas_pump}>
                    <div className={styles.svg_container}>
                        <FaGasPump size={12} />{' '}
                    </div>
                    {withdrawGasPriceinDollars
                        ? withdrawGasPriceinDollars
                        : '…'}
                </div>
            </div>
            {resolvedAddressOrNull}
            {secondaryEnsOrNull}
            <WithdrawButton
                onClick={withdrawFn}
                disabled={isButtonDisabled}
                buttonMessage={buttonMessage}
            />
        </div>
    );
}
