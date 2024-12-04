import { fromDisplayQty, toDisplayQty } from '@crocswap-libs/sdk';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { TokenIF } from '../../../../ambient-utils/types';

import { FaGasPump } from 'react-icons/fa';
import {
    DEFAULT_MAINNET_GAS_PRICE_IN_GWEI,
    DEFAULT_SCROLL_GAS_PRICE_IN_GWEI,
    DEPOSIT_BUFFER_MULTIPLIER_L2,
    DEPOSIT_BUFFER_MULTIPLIER_MAINNET,
    IS_LOCAL_ENV,
    NUM_GWEI_IN_ETH,
    NUM_WEI_IN_GWEI,
    ZERO_ADDRESS,
} from '../../../../ambient-utils/constants';
import {
    GAS_DROPS_ESTIMATE_DEPOSIT_ERC20,
    GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE,
    NUM_GWEI_IN_WEI,
} from '../../../../ambient-utils/constants/';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';
import { useApprove } from '../../../../App/functions/approve';
import useDebounce from '../../../../App/hooks/useDebounce';
import { AppStateContext } from '../../../../contexts';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer, Text } from '../../../../styled/Common';
import {
    MaxButton,
    SVGContainer,
} from '../../../../styled/Components/Portfolio';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../../utils/TransactionError';
import Button from '../../../Form/Button';
import CurrencySelector from '../../../Form/CurrencySelector';
import SmolRefuelLink from '../../../Global/SmolRefuelLink/SmolRefuelLink';

interface propsIF {
    selectedToken: TokenIF;
    tokenAllowance: bigint | undefined;
    tokenWalletBalance: string;
    setRecheckTokenAllowance: Dispatch<SetStateAction<boolean>>;
    setRecheckTokenBalances: Dispatch<SetStateAction<boolean>>;
    selectedTokenDecimals: number;
    setTokenModalOpen?: Dispatch<SetStateAction<boolean>>;
}

export default function Deposit(props: propsIF) {
    const {
        tokenAllowance,
        selectedToken,
        tokenWalletBalance,
        setRecheckTokenAllowance,
        setRecheckTokenBalances,
        selectedTokenDecimals,
        setTokenModalOpen = () => null,
    } = props;
    const { crocEnv, ethMainnetUsdPrice } = useContext(CrocEnvContext);
    const { isUserOnline } = useContext(AppStateContext);
    const {
        gasPriceInGwei,
        isActiveNetworkL2,
        isActiveNetworkBlast,
        isActiveNetworkScroll,
        isActiveNetworkPlume,
    } = useContext(ChainDataContext);

    const { userAddress } = useContext(UserDataContext);

    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);

    const { approve, isApprovalPending } = useApprove();

    const isTokenEth = selectedToken.address === ZERO_ADDRESS;

    const [l1GasFeeLimitInGwei] = useState<number>(
        isActiveNetworkL2 ? 0.0002 * 1e9 : 0,
    );
    const [extraL1GasFeeDeposit] = useState(
        isActiveNetworkScroll ? 0.01 : isActiveNetworkBlast ? 0.01 : 0,
    );

    const [depositGasPriceinDollars, setDepositGasPriceinDollars] = useState<
        string | undefined
    >();

    const amountToReduceNativeTokenQtyMainnet =
        BigInt(Math.ceil(gasPriceInGwei || DEFAULT_MAINNET_GAS_PRICE_IN_GWEI)) *
        BigInt(NUM_WEI_IN_GWEI) *
        BigInt(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE) *
        BigInt(DEPOSIT_BUFFER_MULTIPLIER_MAINNET);

    const amountToReduceNativeTokenQtyL2 =
        BigInt(Math.ceil(gasPriceInGwei || DEFAULT_SCROLL_GAS_PRICE_IN_GWEI)) *
        BigInt(NUM_WEI_IN_GWEI) *
        BigInt(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE) *
        BigInt(DEPOSIT_BUFFER_MULTIPLIER_L2);

    const amountToReduceNativeTokenQty = isActiveNetworkL2
        ? amountToReduceNativeTokenQtyL2
        : amountToReduceNativeTokenQtyMainnet;

    const tokenWalletBalanceAdjustedNonDisplayString =
        isTokenEth && !!tokenWalletBalance
            ? (
                  BigInt(tokenWalletBalance) -
                  amountToReduceNativeTokenQty -
                  BigInt(l1GasFeeLimitInGwei * NUM_GWEI_IN_ETH)
              ).toString()
            : tokenWalletBalance;

    const tokenWalletBalanceDisplay = tokenWalletBalance
        ? toDisplayQty(tokenWalletBalance, selectedTokenDecimals)
        : undefined;

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

    const tokenWalletBalanceTruncated = getFormattedNumber({
        value: tokenWalletBalanceDisplayNum,
    });

    const [depositQtyNonDisplay, setDepositQtyNonDisplay] = useState<
        string | undefined
    >();
    const [buttonMessage, setButtonMessage] = useState<string>('...');
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
    const [isCurrencyFieldDisabled, setIsCurrencyFieldDisabled] =
        useState<boolean>(true);

    const depositQtyNonDisplayNum = useMemo(
        () => parseFloat(depositQtyNonDisplay ?? ''),
        [depositQtyNonDisplay],
    );

    const isDepositQtyValid = useMemo(
        () => depositQtyNonDisplayNum > 0,
        [depositQtyNonDisplay],
    );

    const isTokenAllowanceSufficient = useMemo(
        () =>
            tokenAllowance && isDepositQtyValid && !!depositQtyNonDisplay
                ? tokenAllowance >= BigInt(depositQtyNonDisplay)
                : false,
        [tokenAllowance, isDepositQtyValid, depositQtyNonDisplay],
    );

    const isWalletBalanceSufficientToCoverGas = useMemo(() => {
        if (selectedToken.address !== ZERO_ADDRESS || !depositQtyNonDisplay) {
            return true;
        }
        return tokenWalletBalance
            ? BigInt(tokenWalletBalance) >=
                  amountToReduceNativeTokenQty + BigInt(depositQtyNonDisplay)
            : false;
    }, [
        tokenWalletBalance,
        amountToReduceNativeTokenQty,
        depositQtyNonDisplay,
    ]);

    const isWalletBalanceSufficientToCoverDeposit = useMemo(
        () =>
            tokenWalletBalance && isDepositQtyValid
                ? BigInt(tokenWalletBalance) >=
                  BigInt(depositQtyNonDisplay || 0)
                : tokenWalletBalance && BigInt(tokenWalletBalance) >= BigInt(0)
                  ? true
                  : false,
        [tokenWalletBalance, isDepositQtyValid, depositQtyNonDisplay],
    );

    const [isDepositPending, setIsDepositPending] = useState(false);

    useEffect(() => {
        if (!isUserOnline) {
            setIsButtonDisabled(true);
            setButtonMessage('Currently Offline');
        } else if (isDepositPending) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Deposit Pending`);
        } else if (!depositQtyNonDisplayNum) {
            // if num is undefined or 0
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Enter a Deposit Amount');
        } else if (depositQtyNonDisplayNum < 0) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Enter a Valid Deposit Amount');
        } else if (isApprovalPending) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Approval Pending`);
        } else if (!isWalletBalanceSufficientToCoverDeposit) {
            console.log('setting button to disabled');
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage(
                `${selectedToken.symbol} Wallet Balance Insufficient to Cover Deposit`,
            );
        } else if (!isWalletBalanceSufficientToCoverGas) {
            setIsButtonDisabled(true);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage(
                `${selectedToken.symbol} Wallet Balance Insufficient To Cover Gas`,
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
        isUserOnline,
        depositQtyNonDisplay,
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
        if (crocEnv && isDepositQtyValid && userAddress) {
            try {
                const depositQtyDisplay = toDisplayQty(
                    depositQtyNonDisplay,
                    selectedTokenDecimals,
                );

                setIsDepositPending(true);

                const tx = await crocEnv
                    .token(selectedToken.address)
                    .deposit(depositQtyDisplay, userAddress);

                addPendingTx(tx?.hash);
                if (tx?.hash)
                    addTransactionByType({
                        userAddress: userAddress || '',
                        txHash: tx.hash,
                        txType: 'Deposit',
                        txDescription: `Deposit ${selectedToken.symbol}`,
                    });

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
                        removePendingTx(error.hash);

                        const newTransactionHash = error.replacement.hash;
                        addPendingTx(newTransactionHash);

                        updateTransactionHash(
                            error.hash,
                            error.replacement.hash,
                        );
                        IS_LOCAL_ENV && { newTransactionHash };
                        receipt = error.receipt;
                    } else if (isTransactionFailedError(error)) {
                        console.error({ error });
                        receipt = error.receipt;
                    }
                }

                if (receipt) {
                    addReceipt(JSON.stringify(receipt));
                    removePendingTx(receipt.hash);
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

    const approvalFn = async () => {
        if (depositQtyNonDisplay === undefined) return;
        await approve(
            selectedToken.address,
            selectedToken.symbol,
            setRecheckTokenAllowance,
            isActiveNetworkPlume
                ? BigInt(depositQtyNonDisplay)
                : tokenWalletBalanceDisplay
                  ? fromDisplayQty(
                        tokenWalletBalanceDisplay,
                        selectedToken.decimals,
                    )
                  : undefined,
        );
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

    // calculate price of gas for exchange balance deposit
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                NUM_GWEI_IN_WEI *
                ethMainnetUsdPrice *
                (isTokenEth
                    ? GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE
                    : GAS_DROPS_ESTIMATE_DEPOSIT_ERC20);

            setDepositGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum + extraL1GasFeeDeposit,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice, isTokenEth, extraL1GasFeeDeposit]);

    return (
        <FlexContainer flexDirection='column' gap={16} padding={'16px'}>
            <Text fontSize='body' color='text2'>
                Deposit collateral for future trading at lower gas costs:
            </Text>
            <CurrencySelector
                disable={isCurrencyFieldDisabled}
                selectedToken={selectedToken}
                setQty={setDepositQtyNonDisplay}
                inputValue={inputValue}
                setInputValue={setInputValue}
                setTokenModalOpen={setTokenModalOpen}
            />
            <FlexContainer justifyContent='space-between' alignItems='center'>
                <FlexContainer fontSize='body' color='text2' gap={6}>
                    <Text color='text1'>Available:</Text>
                    {tokenWalletBalanceTruncated || '...'}
                    {tokenWalletBalance !== '0' && (
                        <MaxButton
                            onClick={handleBalanceClick}
                            disabled={false}
                        >
                            Max
                        </MaxButton>
                    )}
                </FlexContainer>
                {
                    <FlexContainer
                        alignItems='center'
                        justifyContent='flex-end'
                        color='text2'
                        fontSize='body'
                    >
                        <SVGContainer>
                            <FaGasPump size={12} />
                        </SVGContainer>
                        {depositGasPriceinDollars
                            ? depositGasPriceinDollars
                            : '…'}
                    </FlexContainer>
                }
            </FlexContainer>
            <SmolRefuelLink />
            <Button
                idForDOM='deposit_tokens_button'
                title={buttonMessage}
                style={{ textTransform: 'none', margin: '0 auto' }}
                action={() => {
                    !isTokenAllowanceSufficient ? approvalFn() : depositFn();
                }}
                disabled={isButtonDisabled}
                flat={true}
            />
        </FlexContainer>
    );
}
