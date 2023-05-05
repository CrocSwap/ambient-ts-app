import styles from './Deposit.module.css';
import DepositButton from './DepositButton/DepositButton';
import DepositCurrencySelector from './DepositCurrencySelector/DepositCurrencySelector';
import { TokenIF } from '../../../../utils/interfaces/exports';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { CrocEnv, toDisplayQty } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
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

interface propsIF {
    crocEnv: CrocEnv | undefined;
    connectedAccount: string;
    selectedToken: TokenIF;
    tokenAllowance: string;
    tokenWalletBalance: string;
    tokenDexBalance: string;
    setRecheckTokenAllowance: Dispatch<SetStateAction<boolean>>;
    setRecheckTokenBalances: Dispatch<SetStateAction<boolean>>;
    openTokenModal: () => void;
    selectedTokenDecimals: number;
    ethMainnetUsdPrice: number | undefined;
    gasPriceInGwei: number | undefined;
}

export default function Deposit(props: propsIF) {
    const {
        crocEnv,
        tokenAllowance,
        connectedAccount,
        selectedToken,
        tokenWalletBalance,
        // tokenDexBalance,
        setRecheckTokenAllowance,
        setRecheckTokenBalances,
        openTokenModal,
        selectedTokenDecimals,
        gasPriceInGwei,
        ethMainnetUsdPrice,
    } = props;

    const dispatch = useAppDispatch();

    const isTokenEth = selectedToken.address === ZERO_ADDRESS;

    /*
        below is the magic number (60000) determined by trial and error
        to avoid a metamask error that the additional cost
        of gas would exceed the user's ETH balance by decreasing
        the amount of ETH being deposited by the estimated gas
         cost of the transaction.
    */

    const estimatedGasAmountForDepositTransaction = 60000;

    const numberOfWeiInGwei = 1e9;

    const tokenWalletBalanceAdjustedNonDisplayString =
        isTokenEth && !!gasPriceInGwei && !!tokenWalletBalance
            ? BigNumber.from(tokenWalletBalance)

                  .sub(
                      BigNumber.from(
                          Math.floor(
                              gasPriceInGwei *
                                  estimatedGasAmountForDepositTransaction *
                                  numberOfWeiInGwei,
                          ),
                      ),
                  )
                  .toString()
            : tokenWalletBalance;

    const tokenWalletBalanceDisplay = useDebounce(
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

    const tokenWalletBalanceTruncated = tokenWalletBalanceDisplayNum
        ? tokenWalletBalanceDisplayNum < 0.0001
            ? 0.0
            : tokenWalletBalanceDisplayNum < 2
            ? tokenWalletBalanceDisplayNum.toPrecision(3)
            : tokenWalletBalanceDisplayNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : undefined;

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

    const isWalletBalanceSufficient = useMemo(
        () =>
            tokenWalletBalanceAdjustedNonDisplayString && !!depositQtyNonDisplay
                ? BigNumber.from(
                      tokenWalletBalanceAdjustedNonDisplayString,
                  ).gte(BigNumber.from(depositQtyNonDisplay))
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
        } else if (!isWalletBalanceSufficient) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage(
                `${selectedToken.symbol} Wallet Balance Insufficient`,
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
        isWalletBalanceSufficient,
        isDepositQtyValid,
        selectedToken.symbol,
    ]);

    useEffect(() => {
        setIsDepositPending(false);
    }, [JSON.stringify(selectedToken)]);

    const deposit = async (depositQtyNonDisplay: string) => {
        if (crocEnv && depositQtyNonDisplay) {
            try {
                const depositQtyDisplay = toDisplayQty(
                    depositQtyNonDisplay,
                    selectedTokenDecimals,
                );

                setIsDepositPending(true);

                const tx = await crocEnv
                    .token(selectedToken.address)
                    .deposit(depositQtyDisplay, connectedAccount);

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
        if (!crocEnv) {
            location.reload();
            return;
        }
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

            if (tokenWalletBalanceDisplay)
                setInputValue(tokenWalletBalanceDisplay);
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
                '$' +
                    gasPriceInDollarsNum.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
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
                <div className={styles.info_text_non_clickable}>
                    Available: {tokenWalletBalanceTruncated || '0.0'}
                    {!isTokenEth && tokenWalletBalance !== '0' ? (
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
