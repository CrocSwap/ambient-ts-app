import { TokenIF } from '../../../../ambient-utils/types';
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
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../../utils/TransactionError';
import { BigNumber } from 'ethers';
import {
    DEFAULT_MAINNET_GAS_PRICE_IN_GWEI,
    DEFAULT_SCROLL_GAS_PRICE_IN_GWEI,
    IS_LOCAL_ENV,
    NUM_WEI_IN_GWEI,
    DEPOSIT_BUFFER_MULTIPLIER_MAINNET,
    DEPOSIT_BUFFER_MULTIPLIER_SCROLL,
    ZERO_ADDRESS,
    NUM_GWEI_IN_ETH,
} from '../../../../ambient-utils/constants';
import { FaGasPump } from 'react-icons/fa';
import useDebounce from '../../../../App/hooks/useDebounce';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';
import { FlexContainer, Text } from '../../../../styled/Common';
import Button from '../../../Form/Button';
import CurrencySelector from '../../../Form/CurrencySelector';
import {
    SVGContainer,
    MaxButton,
} from '../../../../styled/Components/Portfolio';
import { useApprove } from '../../../../App/functions/approve';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import {
    NUM_GWEI_IN_WEI,
    GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE,
    GAS_DROPS_ESTIMATE_DEPOSIT_ERC20,
} from '../../../../ambient-utils/constants/';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';

interface propsIF {
    selectedToken: TokenIF;
    tokenAllowance: string;
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
    const {
        gasPriceInGwei,
        isActiveNetworkL2,
        isActiveNetworkBlast,
        isActiveNetworkScroll,
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
        isActiveNetworkScroll ? 1.25 : isActiveNetworkBlast ? 0.3 : 0,
    );

    const [depositGasPriceinDollars, setDepositGasPriceinDollars] = useState<
        string | undefined
    >();

    const amountToReduceNativeTokenQtyMainnet = BigNumber.from(
        Math.ceil(gasPriceInGwei || DEFAULT_MAINNET_GAS_PRICE_IN_GWEI),
    )
        .mul(BigNumber.from(NUM_WEI_IN_GWEI))
        .mul(BigNumber.from(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE))
        .mul(BigNumber.from(DEPOSIT_BUFFER_MULTIPLIER_MAINNET));

    const amountToReduceNativeTokenQtyL2 = BigNumber.from(
        Math.ceil(gasPriceInGwei || DEFAULT_SCROLL_GAS_PRICE_IN_GWEI),
    )
        .mul(BigNumber.from(NUM_WEI_IN_GWEI))
        .mul(BigNumber.from(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE))
        .mul(BigNumber.from(DEPOSIT_BUFFER_MULTIPLIER_SCROLL));

    const amountToReduceNativeTokenQty = isActiveNetworkL2
        ? amountToReduceNativeTokenQtyL2
        : amountToReduceNativeTokenQtyMainnet;

    const tokenWalletBalanceAdjustedNonDisplayString =
        isTokenEth && !!tokenWalletBalance
            ? BigNumber.from(tokenWalletBalance)

                  .sub(amountToReduceNativeTokenQty)
                  .sub(BigNumber.from(l1GasFeeLimitInGwei * NUM_GWEI_IN_ETH))
                  .toString()
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
                ? BigNumber.from(tokenAllowance).gte(depositQtyNonDisplay)
                : false,
        [tokenAllowance, isDepositQtyValid, depositQtyNonDisplay],
    );

    const isWalletBalanceSufficientToCoverGas = useMemo(() => {
        if (selectedToken.address !== ZERO_ADDRESS || !depositQtyNonDisplay) {
            return true;
        }
        return tokenWalletBalance
            ? BigNumber.from(tokenWalletBalance).gte(
                  amountToReduceNativeTokenQty.add(
                      BigNumber.from(depositQtyNonDisplay),
                  ),
              )
            : false;
    }, [
        tokenWalletBalance,
        amountToReduceNativeTokenQty,
        depositQtyNonDisplay,
    ]);

    const isWalletBalanceSufficientToCoverDeposit = useMemo(
        () =>
            tokenWalletBalance && isDepositQtyValid
                ? BigNumber.from(tokenWalletBalance).gte(
                      BigNumber.from(depositQtyNonDisplay),
                  )
                : tokenWalletBalance &&
                  BigNumber.from(tokenWalletBalance).gte(BigNumber.from(0))
                ? true
                : false,
        [tokenWalletBalance, isDepositQtyValid, depositQtyNonDisplay],
    );

    const [isDepositPending, setIsDepositPending] = useState(false);

    useEffect(() => {
        if (isDepositPending) {
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
                    removePendingTx(receipt.transactionHash);
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
        await approve(
            selectedToken.address,
            selectedToken.symbol,
            setRecheckTokenAllowance,
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
            <Button
                idForDOM='deposit_tokens_button'
                title={buttonMessage}
                style={{ textTransform: 'none' }}
                action={() => {
                    !isTokenAllowanceSufficient ? approvalFn() : depositFn();
                }}
                disabled={isButtonDisabled}
                flat={true}
            />
        </FlexContainer>
    );
}
