import styles from './Deposit.module.css';
import DepositButton from './DepositButton/DepositButton';
import DepositCurrencySelector from './DepositCurrencySelector/DepositCurrencySelector';
import { TokenIF } from '../../../../utils/interfaces/exports';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { toDisplayQty } from '@crocswap-libs/sdk';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
} from '../../../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../../utils/TransactionError';
import { BigNumber } from 'ethers';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../constants';
import { FaGasPump } from 'react-icons/fa';
import useDebounce from '../../../../App/hooks/useDebounce';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { getFormattedTokenBalance } from '../../../../App/functions/getFormattedTokenBalance';

interface propsIF {
    selectedToken: TokenIF;
    tokenAllowance: string;
    tokenWalletBalance: string;
    setRecheckTokenAllowance: Dispatch<SetStateAction<boolean>>;
    setRecheckTokenBalances: Dispatch<SetStateAction<boolean>>;
    openTokenModal: () => void;
    selectedTokenDecimals: number;
}

export default function Deposit(props: propsIF) {
    const {
        tokenAllowance,
        selectedToken,
        tokenWalletBalance,
        setRecheckTokenAllowance,
        setRecheckTokenBalances,
        openTokenModal,
        selectedTokenDecimals,
    } = props;
    const { crocEnv, ethMainnetUsdPrice } = useContext(CrocEnvContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);

    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

    const dispatch = useAppDispatch();

    const isTokenEth = selectedToken.address === ZERO_ADDRESS;

    const amountToReduceEth = BigNumber.from(25).mul('1000000000000000'); // .025 ETH

    const tokenWalletBalanceAdjustedNonDisplayString =
        isTokenEth && !!tokenWalletBalance
            ? BigNumber.from(tokenWalletBalance)

                  .sub(amountToReduceEth)
                  .toString()
            : tokenWalletBalance;

    const tokenWalletBalanceDisplay = useDebounce(
        tokenWalletBalance
            ? toDisplayQty(tokenWalletBalance, selectedTokenDecimals)
            : undefined,
        500,
    );
    const adjustedTokenWalletBalanceDisplay = useDebounce(
        tokenWalletBalanceAdjustedNonDisplayString
            ? toDisplayQty(
                  tokenWalletBalanceAdjustedNonDisplayString,
                  selectedTokenDecimals,
              )
            : undefined,
        500,
    );

    const tokenWalletBalanceDisplayNum = tokenWalletBalanceDisplay
        ? parseFloat(tokenWalletBalanceDisplay)
        : undefined;

    const tokenWalletBalanceTruncated = getFormattedTokenBalance({
        balance: tokenWalletBalanceDisplayNum,
    });

    const [depositQtyNonDisplay, setDepositQtyNonDisplay] = useState<
        string | undefined
    >();
    const [buttonMessage, setButtonMessage] = useState<string>('...');
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
    const [isCurrencyFieldDisabled, setIsCurrencyFieldDisabled] =
        useState<boolean>(true);

    const isTokenAllowanceSufficient = useMemo(
        () =>
            tokenAllowance && !!depositQtyNonDisplay
                ? BigNumber.from(tokenAllowance).gte(depositQtyNonDisplay)
                : false,
        [tokenAllowance, depositQtyNonDisplay],
    );

    const isWalletBalanceSufficientToCoverGas = useMemo(() => {
        if (selectedToken.address !== ZERO_ADDRESS) {
            return true;
        }
        return tokenWalletBalance
            ? BigNumber.from(tokenWalletBalance).gt(amountToReduceEth)
            : false;
    }, [tokenWalletBalance, amountToReduceEth]);

    const isWalletBalanceSufficientToCoverDeposit = useMemo(
        () =>
            tokenWalletBalanceAdjustedNonDisplayString && !!depositQtyNonDisplay
                ? BigNumber.from(
                      tokenWalletBalanceAdjustedNonDisplayString,
                  ).gte(BigNumber.from(depositQtyNonDisplay))
                : tokenWalletBalanceAdjustedNonDisplayString &&
                  BigNumber.from(
                      tokenWalletBalanceAdjustedNonDisplayString,
                  ).gte(BigNumber.from(0))
                ? true
                : false,
        [tokenWalletBalanceAdjustedNonDisplayString, depositQtyNonDisplay],
    );

    const isDepositQtyValid = useMemo(
        () => depositQtyNonDisplay !== undefined,
        [depositQtyNonDisplay],
    );

    const [isApprovalPending, setIsApprovalPending] = useState(false);
    const [isDepositPending, setIsDepositPending] = useState(false);

    useEffect(() => {
        if (isDepositPending) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Deposit Pending`);
        } else if (!depositQtyNonDisplay) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Enter a Deposit Amount');
        } else if (isApprovalPending) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Approval Pending`);
        } else if (!isWalletBalanceSufficientToCoverGas) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage(
                `${selectedToken.symbol} Wallet Balance Insufficient To Cover Gas`,
            );
        } else if (!isWalletBalanceSufficientToCoverDeposit) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage(
                `${selectedToken.symbol} Wallet Balance Insufficient to Cover Deposit`,
            );
        } else if (!isTokenAllowanceSufficient) {
            setIsButtonDisabled(false);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage(`Approve ${selectedToken.symbol}`);
        } else if (isDepositQtyValid) {
            setIsButtonDisabled(false);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Deposit');
        }
    }, [
        isApprovalPending,
        isDepositPending,
        isTokenAllowanceSufficient,
        isWalletBalanceSufficientToCoverDeposit,
        isWalletBalanceSufficientToCoverGas,
        isDepositQtyValid,
        selectedToken.symbol,
    ]);

    useEffect(() => {
        setIsDepositPending(false);
    }, [JSON.stringify(selectedToken)]);

    const deposit = async (depositQtyNonDisplay: string) => {
        if (crocEnv && depositQtyNonDisplay && userAddress) {
            try {
                const depositQtyDisplay = toDisplayQty(
                    depositQtyNonDisplay,
                    selectedTokenDecimals,
                );

                setIsDepositPending(true);

                const tx = await crocEnv
                    .token(selectedToken.address)
                    .deposit(depositQtyDisplay, userAddress);

                dispatch(addPendingTx(tx?.hash));
                if (tx?.hash)
                    dispatch(
                        addTransactionByType({
                            txHash: tx.hash,
                            txType: `Deposit ${selectedToken.symbol}`,
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
                        IS_LOCAL_ENV && 'repriced';
                        dispatch(removePendingTx(error.hash));

                        const newTransactionHash = error.replacement.hash;
                        dispatch(addPendingTx(newTransactionHash));

                        IS_LOCAL_ENV && { newTransactionHash };
                        receipt = error.receipt;
                    } else if (isTransactionFailedError(error)) {
                        console.error({ error });
                        receipt = error.receipt;
                    }
                }

                if (receipt) {
                    dispatch(addReceipt(JSON.stringify(receipt)));
                    dispatch(removePendingTx(receipt.transactionHash));
                    resetDepositQty();
                }
            } catch (error) {
                if (
                    error.reason === 'sending a transaction requires a signer'
                ) {
                    location.reload();
                }
                console.error({ error });
            } finally {
                setIsDepositPending(false);
                setRecheckTokenBalances(true);
            }

            // crocEnv.token(selectedToken.address).deposit(1, wallet.address);
        }
    };

    const depositFn = async () => {
        if (depositQtyNonDisplay) await deposit(depositQtyNonDisplay);
    };

    const approve = async (tokenAddress: string) => {
        if (!crocEnv) return;
        try {
            setIsApprovalPending(true);
            const tx = await crocEnv.token(tokenAddress).approve();
            if (tx) dispatch(addPendingTx(tx?.hash));
            if (tx?.hash)
                dispatch(
                    addTransactionByType({
                        txHash: tx.hash,
                        txType: `Approval of ${selectedToken.symbol}`,
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
                    IS_LOCAL_ENV && 'repriced';
                    dispatch(removePendingTx(error.hash));

                    const newTransactionHash = error.replacement.hash;
                    dispatch(addPendingTx(newTransactionHash));

                    IS_LOCAL_ENV && { newTransactionHash };
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    console.error({ error });
                    receipt = error.receipt;
                }
            }

            if (receipt) {
                dispatch(addReceipt(JSON.stringify(receipt)));
                dispatch(removePendingTx(receipt.transactionHash));
            }
        } catch (error) {
            if (error.reason === 'sending a transaction requires a signer') {
                location.reload();
            }
            console.error({ error });
        } finally {
            setIsApprovalPending(false);
            setRecheckTokenAllowance(true);
        }
    };

    const approvalFn = async () => {
        await approve(selectedToken.address);
    };

    const resetDepositQty = () => {
        setDepositQtyNonDisplay(undefined);
        setInputValue('');
    };

    useEffect(() => {
        resetDepositQty();
    }, [selectedToken.address]);

    const isTokenWalletBalanceGreaterThanZero =
        parseFloat(tokenWalletBalance) > 0;

    const [inputValue, setInputValue] = useState('');

    const handleBalanceClick = () => {
        if (isTokenWalletBalanceGreaterThanZero) {
            setDepositQtyNonDisplay(tokenWalletBalanceAdjustedNonDisplayString);

            if (adjustedTokenWalletBalanceDisplay)
                setInputValue(adjustedTokenWalletBalanceDisplay);
        }
    };

    const [depositGasPriceinDollars, setDepositGasPriceinDollars] = useState<
        string | undefined
    >();

    const averageGasUnitsForEthDeposit = 40000;
    const averageGasUnitsForErc20Deposit = 67000;
    const gweiInWei = 1e-9;

    // calculate price of gas for exchange balance deposit
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                gweiInWei *
                ethMainnetUsdPrice *
                (isTokenEth
                    ? averageGasUnitsForEthDeposit
                    : averageGasUnitsForErc20Deposit);

            setDepositGasPriceinDollars(
                getFormattedTokenBalance({
                    balance: gasPriceInDollarsNum,
                    isUSD: true,
                    prefix: '$',
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice, isTokenEth]);

    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text_non_clickable}>
                Deposit collateral for future trading at lower gas costs:
            </div>
            <DepositCurrencySelector
                fieldId='exchange-balance-deposit'
                onClick={() => openTokenModal()}
                disable={isCurrencyFieldDisabled}
                selectedToken={selectedToken}
                setDepositQty={setDepositQtyNonDisplay}
                inputValue={inputValue}
                setInputValue={setInputValue}
            />
            <div className={styles.additional_info}>
                <div
                    className={`${styles.available_container} ${styles.info_text_non_clickable}`}
                >
                    <div className={styles.available_text}>Available:</div>
                    {tokenWalletBalanceTruncated || '0.0'}
                    {isWalletBalanceSufficientToCoverDeposit ? (
                        <button
                            className={`${styles.max_button} ${styles.max_button_enable}`}
                            onClick={handleBalanceClick}
                        >
                            Max
                        </button>
                    ) : null}
                </div>
                <div className={styles.gas_pump}>
                    <div className={styles.svg_container}>
                        <FaGasPump size={12} />{' '}
                    </div>
                    {depositGasPriceinDollars ? depositGasPriceinDollars : '…'}
                </div>
            </div>
            <DepositButton
                onClick={() => {
                    !isTokenAllowanceSufficient ? approvalFn() : depositFn();
                }}
                disabled={isButtonDisabled}
                buttonMessage={buttonMessage}
            />
        </div>
    );
}
