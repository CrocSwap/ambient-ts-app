import { CrocEnv, toDisplayQty } from '@crocswap-libs/sdk';
import { TokenIF } from '../../../../utils/interfaces/exports';
import styles from './Withdraw.module.css';
import WithdrawButton from './WithdrawButton/WithdrawButton';
import WithdrawCurrencySelector from './WithdrawCurrencySelector/WithdrawCurrencySelector';
// import { defaultTokens } from '../../../../utils/data/defaultTokens';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
// import { setToken } from '../../../../utils/state/temp';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import TransferAddressInput from '../Transfer/TransferAddressInput/TransferAddressInput';
import Toggle from '../../../Global/Toggle/Toggle';
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
import { checkBlacklist } from '../../../../utils/data/blacklist';
import { FaGasPump } from 'react-icons/fa';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../constants';

interface propsIF {
    crocEnv: CrocEnv | undefined;
    connectedAccount: string;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    selectedToken: TokenIF;
    tokenWalletBalance: string;
    tokenDexBalance: string;
    setRecheckTokenBalances: Dispatch<SetStateAction<boolean>>;
    lastBlockNumber: number;
    sendToAddress: string | undefined;
    resolvedAddress: string | undefined;
    setSendToAddress: Dispatch<SetStateAction<string | undefined>>;
    secondaryEnsName: string | undefined;
    openTokenModal: () => void;
    gasPriceInGwei: number | undefined;
    ethMainnetUsdPrice: number | undefined;
}

export default function Withdraw(props: propsIF) {
    const {
        crocEnv,
        connectedAccount,
        // openGlobalModal,
        // closeGlobalModal,
        selectedToken,
        // tokenAllowance,
        // tokenWalletBalance,
        tokenDexBalance,
        // setRecheckTokenAllowance,
        setRecheckTokenBalances,
        // lastBlockNumber,
        sendToAddress,
        resolvedAddress,
        setSendToAddress,
        secondaryEnsName,
        openTokenModal,
        ethMainnetUsdPrice,
        gasPriceInGwei,
    } = props;

    const dispatch = useAppDispatch();

    const selectedTokenDecimals = selectedToken.decimals;

    const isTokenDexBalanceGreaterThanZero = parseFloat(tokenDexBalance) > 0;

    const tokenExchangeDepositsDisplay = tokenDexBalance
        ? toDisplayQty(tokenDexBalance, selectedTokenDecimals)
        : undefined;

    const tokenExchangeDepositsDisplayNum = tokenExchangeDepositsDisplay
        ? parseFloat(tokenExchangeDepositsDisplay)
        : undefined;

    const tokenDexBalanceTruncated = tokenExchangeDepositsDisplayNum
        ? tokenExchangeDepositsDisplayNum < 0.0001
            ? tokenExchangeDepositsDisplayNum.toExponential(2)
            : tokenExchangeDepositsDisplayNum < 2
            ? tokenExchangeDepositsDisplayNum.toPrecision(3)
            : // : tokenDexBalanceNum >= 100000
              // ? formatAmountOld(tokenDexBalanceNum)
              tokenExchangeDepositsDisplayNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : undefined;

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
        } else if (!withdrawQtyNonDisplay) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Enter a Withdrawal Amount');
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
        isWithdrawPending,
        isDexBalanceSufficient,
        isWithdrawQtyValid,
        selectedToken.symbol,
        isResolvedAddressValid,
        isSendToAddressChecked,
    ]);

    const withdraw = async (withdrawQtyNonDisplay: string) => {
        if (crocEnv && withdrawQtyNonDisplay) {
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
                        .withdraw(depositQtyDisplay, connectedAccount);
                }
                dispatch(addPendingTx(tx?.hash));
                if (tx?.hash)
                    dispatch(
                        addTransactionByType({
                            txHash: tx.hash,
                            txType: `Withdrawal of ${selectedToken.symbol}`,
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

                        IS_LOCAL_ENV && console.debug({ newTransactionHash });
                        receipt = error.receipt;

                        //  if (newTransactionHash) {
                        //      fetch(
                        //          newSwapCacheEndpoint +
                        //              new URLSearchParams({
                        //                  tx: newTransactionHash,
                        //                  user: account ?? '',
                        //                  base: isSellTokenBase ? sellTokenAddress : buyTokenAddress,
                        //                  quote: isSellTokenBase
                        //                      ? buyTokenAddress
                        //                      : sellTokenAddress,
                        //                  poolIdx: (await env.context).chain.poolIndex.toString(),
                        //                  isBuy: isSellTokenBase.toString(),
                        //                  inBaseQty: inBaseQty.toString(),
                        //                  qty: crocQty.toString(),
                        //                  override: 'false',
                        //                  chainId: chainId,
                        //                  limitPrice: '0',
                        //                  minOut: '0',
                        //              }),
                        //      );
                        //  }
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

    // const withdrawInput = document.getElementById(
    //     'exchange-balance-withdraw-exchange-balance-withdraw-quantity',
    // ) as HTMLInputElement;

    const resetWithdrawQty = () => {
        // if (withdrawInput) {
        //     withdrawInput.value = '';
        // }
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
                {/* <div className={styles.hex_address}>{secondaryEnsName}</div> */}
            </div>
        ) : null;

    const toggleContent = (
        <span className={styles.surplus_toggle}>
            Send to a different address
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
        </span>
    );

    const [inputValue, setInputValue] = useState('');

    const handleBalanceClick = () => {
        if (isTokenDexBalanceGreaterThanZero) {
            setWithdrawQtyNonDisplay(tokenDexBalance);
            if (tokenExchangeDepositsDisplay)
                setInputValue(tokenExchangeDepositsDisplay);
            // if (withdrawInput && tokenExchangeDepositsDisplay)
            //     withdrawInput.value = tokenExchangeDepositsDisplay;
        }
    };

    const [withdrawGasPriceinDollars, setWithdrawGasPriceinDollars] = useState<
        string | undefined
    >();

    const isTokenEth = selectedToken.address === ZERO_ADDRESS;

    const averageGasUnitsForEthWithdrawal = 47000;
    const averageGasUnitsForErc20Withdrawal = 60000;
    const gweiInWei = 1e-9;

    // calculate price of gas for withdrawal
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                gweiInWei *
                ethMainnetUsdPrice *
                (isTokenEth
                    ? averageGasUnitsForEthWithdrawal
                    : averageGasUnitsForErc20Withdrawal);

            setWithdrawGasPriceinDollars(
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
                Withdraw deposited collateral to your wallet:
            </div>
            {toggleContent}
            {transferAddressOrNull}
            <WithdrawCurrencySelector
                fieldId='exchange-balance-withdraw'
                onClick={() => openTokenModal()}
                selectedToken={selectedToken}
                setWithdrawQty={setWithdrawQtyNonDisplay}
                isSendToAddressChecked={isSendToAddressChecked}
                setIsSendToAddressChecked={setIsSendToAddressChecked}
                inputValue={inputValue}
                setInputValue={setInputValue}
                disable={isCurrencyFieldDisabled}
            />
            <div className={styles.additional_info}>
                <div className={styles.info_text_non_clickable}>
                    Available: {tokenDexBalanceTruncated || '0.0'}
                    <button
                        className={`${styles.max_button} ${styles.max_button_enable}`}
                        onClick={handleBalanceClick}
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
                onClick={() => {
                    withdrawFn();
                }}
                // onClick={() => {
                //     !isTokenAllowanceSufficient ? approvalFn() : withdrawFn();
                // }}
                disabled={isButtonDisabled}
                buttonMessage={buttonMessage}
            />
        </div>
    );
}
