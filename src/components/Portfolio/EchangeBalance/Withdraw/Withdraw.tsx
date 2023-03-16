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
}

export default function Withdraw(props: propsIF) {
    const {
        crocEnv,
        connectedAccount,
        // openGlobalModal,
        // closeGlobalModal,
        selectedToken,
        // tokenAllowance,
        tokenWalletBalance,
        tokenDexBalance,
        // setRecheckTokenAllowance,
        setRecheckTokenBalances,
        lastBlockNumber,
        sendToAddress,
        resolvedAddress,
        setSendToAddress,
        secondaryEnsName,
        openTokenModal,
    } = props;

    const dispatch = useAppDispatch();

    const selectedTokenDecimals = selectedToken.decimals;

    const tokenWalletBalanceDisplay = tokenWalletBalance
        ? toDisplayQty(tokenWalletBalance, selectedTokenDecimals)
        : undefined;

    const tokenWalletBalanceDisplayNum = tokenWalletBalanceDisplay
        ? parseFloat(tokenWalletBalanceDisplay)
        : undefined;

    const tokenWalletBalanceTruncated = tokenWalletBalanceDisplayNum
        ? tokenWalletBalanceDisplayNum < 0.0001
            ? tokenWalletBalanceDisplayNum.toExponential(2)
            : tokenWalletBalanceDisplayNum < 2
            ? tokenWalletBalanceDisplayNum.toPrecision(3)
            : // : tokenWalletBalanceNum >= 100000
              // ? formatAmountOld(tokenWalletBalanceNum)
              tokenWalletBalanceDisplayNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : undefined;

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

    const [isSendToAddressChecked, setIsSendToAddressChecked] =
        useState<boolean>(false);
    const [sendToAddressWalletBalance, setSendToAddressWalletBalance] =
        useState<string>('');
    const [
        recheckSendToAddressWalletBalance,
        setRecheckSendToAddressWalletBalance,
    ] = useState<boolean>(false);

    const sendToAddressBalanceDisplay = sendToAddressWalletBalance
        ? toDisplayQty(sendToAddressWalletBalance, selectedTokenDecimals)
        : undefined;

    const sendToAddressBalanceDisplayNum = sendToAddressBalanceDisplay
        ? parseFloat(sendToAddressBalanceDisplay)
        : undefined;

    const sendToAddressBalanceTruncated = sendToAddressBalanceDisplayNum
        ? sendToAddressBalanceDisplayNum < 0.0001
            ? sendToAddressBalanceDisplayNum.toExponential(2)
            : sendToAddressBalanceDisplayNum < 2
            ? sendToAddressBalanceDisplayNum.toPrecision(3)
            : // : tokenWalletBalanceNum >= 100000
              // ? formatAmountOld(tokenWalletBalanceNum)
              sendToAddressBalanceDisplayNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : undefined;

    const isResolvedAddressValid = useMemo(() => {
        if (!resolvedAddress) return false;

        const isResolvedAddressBlacklisted = checkBlacklist(resolvedAddress);

        return (
            !isResolvedAddressBlacklisted &&
            resolvedAddress?.length === 42 &&
            resolvedAddress.startsWith('0x')
        );
    }, [resolvedAddress]);

    useEffect(() => {
        if (
            crocEnv &&
            selectedToken.address &&
            resolvedAddress &&
            isSendToAddressChecked &&
            isResolvedAddressValid
        ) {
            crocEnv
                .token(selectedToken.address)
                .wallet(resolvedAddress)
                .then((bal: BigNumber) => {
                    setSendToAddressWalletBalance(bal.toString());
                })
                .catch(console.log);
        } else {
            setSendToAddressWalletBalance('');
        }
        setRecheckSendToAddressWalletBalance(false);
    }, [
        crocEnv,
        selectedToken.address,
        resolvedAddress,
        lastBlockNumber,
        isSendToAddressChecked,
        recheckSendToAddressWalletBalance,
    ]);

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

    // const [isApprovalPending, setIsApprovalPending] = useState(false);
    const [isWithdrawPending, setIsWithdrawPending] = useState(false);

    useEffect(() => {
        setIsWithdrawPending(false);
    }, [JSON.stringify(selectedToken)]);

    // const chooseToken = (tok: TokenIF) => {
    //     console.log(tok);
    //     dispatch(setToken(tok));
    //     closeGlobalModal();
    // };

    useEffect(() => {
        // console.log({ isDepositQtyValid });
        if (isSendToAddressChecked && !isResolvedAddressValid) {
            setIsButtonDisabled(true);
            setButtonMessage('Please Enter a Valid Address');
        } else if (!withdrawQtyNonDisplay) {
            setIsButtonDisabled(true);
            setButtonMessage('Enter a Withdrawal Amount');
        } else if (!isDexBalanceSufficient) {
            setIsButtonDisabled(true);
            setButtonMessage(
                `${selectedToken.symbol} Exchange Balance Insufficient`,
            );
        }
        // else if (isApprovalPending) {
        //     setIsButtonDisabled(true);
        //     setButtonMessage(`${selectedToken.symbol} Approval Pending`);
        // }
        else if (isWithdrawPending) {
            setIsButtonDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Withdrawal Pending`);
        }
        // else if (!isTokenAllowanceSufficient) {
        //     setIsButtonDisabled(false);
        //     setButtonMessage(`Click to Approve ${selectedToken.symbol}`);
        // }
        else if (isWithdrawQtyValid) {
            setIsButtonDisabled(false);
            setButtonMessage('Withdraw');
        }
    }, [
        // isApprovalPending,
        isWithdrawPending,
        // isTokenAllowanceSufficient,
        isDexBalanceSufficient,
        isWithdrawQtyValid,
        selectedToken.symbol,
        isResolvedAddressValid,
        isSendToAddressChecked,
    ]);

    // const chooseTokenDiv = (
    //     <div>
    //         {defaultTokens
    //             .filter((token: TokenIF) => token.chainId === parseInt('0x5'))
    //             .map((token: TokenIF) => (
    //                 <button key={'button_to_set_' + token.name} onClick={() => chooseToken(token)}>
    //                     {token.name}
    //                 </button>
    //             ))}
    //     </div>
    // );

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
                            txType: 'Withdrawal',
                        }),
                    );

                let receipt;
                try {
                    if (tx) receipt = await tx.wait();
                } catch (e) {
                    const error = e as TransactionError;
                    console.log({ error });
                    // The user used "speed up" or something similar
                    // in their client, but we now have the updated info
                    if (isTransactionReplacedError(error)) {
                        console.log('repriced');
                        dispatch(removePendingTx(error.hash));

                        const newTransactionHash = error.replacement.hash;
                        dispatch(addPendingTx(newTransactionHash));

                        console.log({ newTransactionHash });
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
                        // console.log({ error });
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
                console.warn({ error });
            } finally {
                setIsWithdrawPending(false);
                setRecheckTokenBalances(true);
                if (isSendToAddressChecked)
                    setRecheckSendToAddressWalletBalance(true);
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
        />
    ) : null;

    // const approve = async (tokenAddress: string) => {
    //     if (!crocEnv) return;
    //     try {
    //         setIsApprovalPending(true);
    //         const tx = await crocEnv.token(tokenAddress).approve();
    //         if (tx) {
    //             await tx.wait();
    //         }
    //     } catch (error) {
    //         console.warn({ error });
    //     } finally {
    //         setIsApprovalPending(false);
    //         setRecheckTokenAllowance(true);
    //     }
    // };

    // const approvalFn = async () => {
    //     await approve(selectedToken.address);
    // };
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
            />
            <div
                onClick={handleBalanceClick}
                className={
                    isTokenDexBalanceGreaterThanZero
                        ? styles.info_text_clickable
                        : styles.info_text_non_clickable
                }
            >
                Your Exchange Balance ({selectedToken.symbol}):{' '}
                {tokenDexBalanceTruncated || '0.0'}
            </div>
            <div className={styles.info_text_non_clickable}>
                {isSendToAddressChecked
                    ? `Destination Wallet Balance (${selectedToken.symbol}): `
                    : `Your Wallet Balance (${selectedToken.symbol}): `}
                {isSendToAddressChecked
                    ? sendToAddressBalanceTruncated || '0.0'
                    : tokenWalletBalanceTruncated || '0.0'}
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
