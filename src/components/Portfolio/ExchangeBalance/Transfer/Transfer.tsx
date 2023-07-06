import { toDisplayQty } from '@crocswap-libs/sdk';
import { TokenIF } from '../../../../utils/interfaces/exports';
import styles from './Transfer.module.css';
import TransferAddressInput from './TransferAddressInput/TransferAddressInput';
import TransferButton from './TransferButton/TransferButton';
import TransferCurrencySelector from './TransferCurrencySelector/TransferCurrencySelector';
// import { defaultTokens } from '../../../../utils/data/defaultTokens';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
// import { setToken } from '../../../../utils/state/temp';
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
import useDebounce from '../../../../App/hooks/useDebounce';
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
    openTokenModal: () => void;
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
        openTokenModal,
    } = props;
    const { crocEnv, ethMainnetUsdPrice } = useContext(CrocEnvContext);

    const { gasPriceInGwei } = useContext(ChainDataContext);

    const dispatch = useAppDispatch();

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
            tokenDexBalance && !!transferQtyNonDisplay
                ? BigNumber.from(tokenDexBalance).gte(
                      BigNumber.from(transferQtyNonDisplay),
                  )
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
        if (isTransferPending) {
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
                dispatch(addPendingTx(tx?.hash));
                if (tx?.hash)
                    dispatch(
                        addTransactionByType({
                            txHash: tx.hash,
                            txType: `Transfer ${selectedToken.symbol}`,
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
                    resetTransferQty();
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
        <div className={styles.info_text_non_clickable}>
            Resolved Destination Address:
            <div className={styles.hex_address}>{resolvedAddress}</div>
        </div>
    ) : null;

    const secondaryEnsOrNull = secondaryEnsName ? (
        <div className={styles.info_text_non_clickable}>
            Destination ENS Address: {secondaryEnsName}
            {/* <div className={styles.hex_address}>{secondaryEnsName}</div> */}
        </div>
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

            // if (transferInput && tokenExchangeDepositsDisplay)
            //     transferInput.value = tokenExchangeDepositsDisplay;
            if (tokenExchangeDepositsDisplay)
                setInputValue(tokenExchangeDepositsDisplay);
        }
    };

    const [transferGasPriceinDollars, setTransferGasPriceinDollars] = useState<
        string | undefined
    >();

    const isTokenEth = selectedToken.address === ZERO_ADDRESS;

    const averageGasUnitsForEthTransfer = 45000;
    const averageGasUnitsForErc20Transfer = 45000;
    const gweiInWei = 1e-9;

    // calculate price of gas for exchange balance transfer
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                gweiInWei *
                ethMainnetUsdPrice *
                (isTokenEth
                    ? averageGasUnitsForEthTransfer
                    : averageGasUnitsForErc20Transfer);

            setTransferGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                    prefix: '$',
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice, isTokenEth]);

    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text_non_clickable}>
                Transfer deposited collateral to another deposit account:
            </div>
            <TransferAddressInput
                fieldId='exchange-balance-transfer-address'
                setTransferToAddress={setSendToAddress}
                sendToAddress={sendToAddress}
                disable={isAddressFieldDisabled}
            />
            <TransferCurrencySelector
                fieldId='exchange-balance-transfer'
                onClick={() => openTokenModal()}
                selectedToken={selectedToken}
                setTransferQty={setTransferQtyNonDisplay}
                inputValue={inputValue}
                setInputValue={setInputValue}
                disable={isCurrencyFieldDisabled}
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
                    {transferGasPriceinDollars
                        ? transferGasPriceinDollars
                        : '…'}
                </div>
            </div>
            {resolvedAddressOrNull}
            {secondaryEnsOrNull}
            <TransferButton
                onClick={() => {
                    transferFn();
                }}
                disabled={isButtonDisabled}
                buttonMessage={buttonMessage}
            />
        </div>
    );
}
