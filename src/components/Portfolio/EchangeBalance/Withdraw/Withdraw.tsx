import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import styles from './Withdraw.module.css';
import WithdrawButton from './WithdrawButton/WithdrawButton';
import WithdrawCurrencySelector from './WithdrawCurrencySelector/WithdrawCurrencySelector';
import { defaultTokens } from '../../../../utils/data/defaultTokens';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setToken } from '../../../../utils/state/temp';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import TransferAddressInput from '../Transfer/TransferAddressInput/TransferAddressInput';

interface PortfolioWithdrawProps {
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
}

export default function Withdraw(props: PortfolioWithdrawProps) {
    const {
        crocEnv,
        connectedAccount,
        openGlobalModal,
        closeGlobalModal,
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
    } = props;

    const dispatch = useAppDispatch();

    const [withdrawQty, setWithdrawQty] = useState<number>(0);
    const [buttonMessage, setButtonMessage] = useState<string>('...');
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

    const [isSendToAddressChecked, setIsSendToAddressChecked] = useState<boolean>(false);
    const [sendToAddressWalletBalance, setSendToAddressWalletBalance] = useState<string>('');
    const [recheckSendToAddressWalletBalance, setRecheckSendToAddressWalletBalance] =
        useState<boolean>(false);

    const isResolvedAddressValid = useMemo(
        () => resolvedAddress?.length === 42 && resolvedAddress.startsWith('0x'),
        [resolvedAddress],
    );

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
                .walletDisplay(resolvedAddress)
                .then((bal: string) => {
                    setSendToAddressWalletBalance(bal);
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

    // const isTokenAllowanceSufficient = useMemo(
    //     () => (tokenAllowance !== '0.0' ? parseFloat(tokenAllowance) >= withdrawQty : false),
    //     [tokenAllowance, withdrawQty],
    // );
    const isDexBalanceSufficient = useMemo(
        () => (tokenDexBalance !== '0.0' ? parseFloat(tokenDexBalance) >= withdrawQty : false),
        [tokenDexBalance, withdrawQty],
    );

    const isWithdrawQtyValid = useMemo(() => withdrawQty > 0, [withdrawQty]);

    // const [isApprovalPending, setIsApprovalPending] = useState(false);
    const [isWithdrawPending, setIsWithdrawPending] = useState(false);

    const chooseToken = (tok: TokenIF) => {
        console.log(tok);
        dispatch(setToken(tok));
        closeGlobalModal();
    };

    useEffect(() => {
        // console.log({ isDepositQtyValid });
        // console.log({ isTokenAllowanceSufficient });
        if (!withdrawQty) {
            setIsButtonDisabled(true);
            setButtonMessage('Please Enter Token Quantity');
        } else if (!isDexBalanceSufficient) {
            setIsButtonDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Exchange Balance Insufficient`);
        } else if (isSendToAddressChecked && !isResolvedAddressValid) {
            setIsButtonDisabled(true);
            setButtonMessage('Please enter a valid address');
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

    const chooseTokenDiv = (
        <div>
            {defaultTokens
                .filter((token: TokenIF) => token.chainId === parseInt('0x5'))
                .map((token: TokenIF) => (
                    <button key={'button_to_set_' + token.name} onClick={() => chooseToken(token)}>
                        {token.name}
                    </button>
                ))}
        </div>
    );

    const withdraw = async (withdrawQty: number) => {
        if (crocEnv && withdrawQty) {
            try {
                setIsWithdrawPending(true);
                let tx;
                if (isSendToAddressChecked && resolvedAddress) {
                    tx = await crocEnv
                        .token(selectedToken.address)
                        .withdraw(withdrawQty, resolvedAddress);
                } else {
                    tx = await crocEnv
                        .token(selectedToken.address)
                        .withdraw(withdrawQty, connectedAccount);
                }

                if (tx) {
                    await tx.wait();
                }
            } catch (error) {
                console.warn({ error });
            } finally {
                setIsWithdrawPending(false);
                setRecheckTokenBalances(true);
                if (isSendToAddressChecked) setRecheckSendToAddressWalletBalance(true);
            }
        }
    };

    const withdrawFn = async () => {
        await withdraw(withdrawQty);
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

    const resolvedAddressOrNull = isResolvedAddressDifferent ? (
        <div className={styles.info_text}>
            Resolved Hex Address:
            <div className={styles.hex_address}>{resolvedAddress}</div>
        </div>
    ) : null;

    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text}>Withdraw tokens from the exchange to your wallet</div>
            <WithdrawCurrencySelector
                fieldId='exchange-balance-withdraw'
                onClick={() => openGlobalModal(chooseTokenDiv)}
                selectedToken={selectedToken}
                setWithdrawQty={setWithdrawQty}
                isSendToAddressChecked={isSendToAddressChecked}
                setIsSendToAddressChecked={setIsSendToAddressChecked}
            />
            {transferAddressOrNull}
            <div className={styles.info_text}>
                Your Exchange Balance ({selectedToken.symbol}): {tokenDexBalance}
            </div>
            <div className={styles.info_text}>
                {isSendToAddressChecked
                    ? `Destination Wallet Balance (${selectedToken.symbol}): `
                    : `Your Wallet Balance (${selectedToken.symbol}): `}
                {isSendToAddressChecked ? sendToAddressWalletBalance : tokenWalletBalance}
            </div>
            {resolvedAddressOrNull}
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
