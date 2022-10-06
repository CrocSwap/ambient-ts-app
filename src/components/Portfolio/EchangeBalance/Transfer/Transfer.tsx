import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import styles from './Transfer.module.css';
import TransferAddressInput from './TransferAddressInput/TransferAddressInput';
import TransferButton from './TransferButton/TransferButton';
import TransferCurrencySelector from './TransferCurrencySelector/TransferCurrencySelector';
import { defaultTokens } from '../../../../utils/data/defaultTokens';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { setToken } from '../../../../utils/state/temp';
import {
    addPendingTx,
    addReceipt,
    removePendingTx,
} from '../../../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../../utils/TransactionError';

interface PortfolioTransferProps {
    crocEnv: CrocEnv | undefined;
    // connectedAccount: string;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    selectedToken: TokenIF;
    tokenDexBalance: string;
    setRecheckTokenBalances: Dispatch<SetStateAction<boolean>>;
    lastBlockNumber: number;
    sendToAddress: string | undefined;
    resolvedAddress: string | undefined;
    setSendToAddress: Dispatch<SetStateAction<string | undefined>>;
    secondaryEnsName: string | undefined;
}

export default function Transfer(props: PortfolioTransferProps) {
    const {
        crocEnv,
        openGlobalModal,
        closeGlobalModal,
        selectedToken, // tokenAllowance,
        tokenDexBalance,
        // setRecheckTokenAllowance,
        setRecheckTokenBalances,
        lastBlockNumber,
        sendToAddress,
        resolvedAddress,
        setSendToAddress,
        secondaryEnsName,
    } = props;

    const dispatch = useAppDispatch();

    const [transferQty, setTransferQty] = useState<number>(0);
    const [buttonMessage, setButtonMessage] = useState<string>('...');
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
    const [sendToAddressDexBalance, setSendToAddressDexBalance] = useState<string>('');
    const [recheckSendToAddressDexBalance, setRecheckSendToAddressDexBalance] =
        useState<boolean>(false);

    const isResolvedAddressValid = useMemo(
        () => resolvedAddress?.length === 42 && resolvedAddress.startsWith('0x'),
        [resolvedAddress],
    );
    useEffect(() => {
        if (crocEnv && selectedToken.address && resolvedAddress && isResolvedAddressValid) {
            crocEnv
                .token(selectedToken.address)
                .balanceDisplay(resolvedAddress)
                .then((bal: string) => {
                    setSendToAddressDexBalance(bal);
                })
                .catch(console.log);
        } else {
            setSendToAddressDexBalance('');
        }
        setRecheckSendToAddressDexBalance(false);
    }, [
        crocEnv,
        selectedToken.address,
        resolvedAddress,
        lastBlockNumber,
        recheckSendToAddressDexBalance,
    ]);

    const isDexBalanceSufficient = useMemo(
        () => (tokenDexBalance !== '0.0' ? parseFloat(tokenDexBalance) >= transferQty : false),
        [tokenDexBalance, transferQty],
    );

    const isTransferQtyValid = useMemo(() => transferQty > 0, [transferQty]);

    // const [isApprovalPending, setIsApprovalPending] = useState(false);
    const [isTransferPending, setIsTransferPending] = useState(false);

    const chooseToken = (tok: TokenIF) => {
        console.log(tok);
        dispatch(setToken(tok));
        closeGlobalModal();
    };

    useEffect(() => {
        // console.log({ isDepositQtyValid });
        // console.log({ isTokenAllowanceSufficient });
        if (!isResolvedAddressValid) {
            setIsButtonDisabled(true);
            setButtonMessage('Please enter a valid address');
        } else if (!transferQty) {
            setIsButtonDisabled(true);
            setButtonMessage('Please Enter Token Quantity');
        } else if (!isDexBalanceSufficient) {
            setIsButtonDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Exchange Balance Insufficient`);
        }
        // else if (isApprovalPending) {
        //     setIsButtonDisabled(true);
        //     setButtonMessage(`${selectedToken.symbol} Approval Pending`);
        // }
        else if (isTransferPending) {
            setIsButtonDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Transfer Pending`);
        }
        // else if (!isTokenAllowanceSufficient) {
        //     setIsButtonDisabled(false);
        //     setButtonMessage(`Click to Approve ${selectedToken.symbol}`);
        // }
        else if (isTransferQtyValid) {
            setIsButtonDisabled(false);
            setButtonMessage('Transfer');
        }
    }, [
        // isApprovalPending,
        isTransferPending,
        // isTokenAllowanceSufficient,
        isDexBalanceSufficient,
        isTransferQtyValid,
        selectedToken.symbol,
        isResolvedAddressValid,
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

    const transfer = async (transferQty: number) => {
        if (crocEnv && transferQty && resolvedAddress) {
            try {
                setIsTransferPending(true);
                const tx = await crocEnv
                    .token(selectedToken.address)
                    .transfer(transferQty, resolvedAddress);
                dispatch(addPendingTx(tx?.hash));
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
                }
            } catch (error) {
                console.warn({ error });
            } finally {
                setIsTransferPending(false);
                setRecheckTokenBalances(true);
                setRecheckSendToAddressDexBalance(true);
            }
        }
    };

    const transferFn = async () => {
        await transfer(transferQty);
    };

    const isResolvedAddressDifferent = resolvedAddress !== sendToAddress;

    const resolvedAddressOrNull = isResolvedAddressDifferent ? (
        <div className={styles.info_text}>
            Resolved Destination Address:
            <div className={styles.hex_address}>{resolvedAddress}</div>
        </div>
    ) : null;

    const secondaryEnsOrNull = secondaryEnsName ? (
        <div className={styles.info_text}>
            Destination ENS Address:
            <div className={styles.hex_address}>{secondaryEnsName}</div>
        </div>
    ) : null;

    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text}>
                Transfer tokens to another account within the exchange
            </div>
            <TransferAddressInput
                fieldId='exchange-balance-transfer-address'
                setTransferToAddress={setSendToAddress}
                sendToAddress={sendToAddress}
            />
            <TransferCurrencySelector
                fieldId='exchange-balance-transfer'
                onClick={() => openGlobalModal(chooseTokenDiv)}
                selectedToken={selectedToken}
                setTransferQty={setTransferQty}
            />
            <div className={styles.info_text}>
                Your Exchange Balance ({selectedToken.symbol}): {tokenDexBalance}
            </div>
            <div className={styles.info_text}>
                Destination Exchange Balance ({selectedToken.symbol}): {sendToAddressDexBalance}
            </div>
            {resolvedAddressOrNull}
            {secondaryEnsOrNull}
            <TransferButton
                onClick={() => {
                    // console.log('clicked');
                    transferFn();
                }}
                disabled={isButtonDisabled}
                buttonMessage={buttonMessage}
            />
        </div>
    );
}
