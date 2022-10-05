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
        if (!transferQty) {
            setIsButtonDisabled(true);
            setButtonMessage('Please Enter Token Quantity');
        } else if (!isDexBalanceSufficient) {
            setIsButtonDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Exchange Balance Insufficient`);
        } else if (!isResolvedAddressValid) {
            setIsButtonDisabled(true);
            setButtonMessage('Please enter a valid address');
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

                if (tx) {
                    await tx.wait();
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
