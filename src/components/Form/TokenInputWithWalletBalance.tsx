import { getFormattedNumber } from '../../ambient-utils/dataLayer';
import { TokenIF } from '../../ambient-utils/types';
import { memo } from 'react';
import { formatTokenInput, stringToBigInt } from '../../utils/numbers';
import TokenInputQuantity from './TokenInputQuantity';
import { RefreshButton } from '../../styled/Components/TradeModules';
import { FiRefreshCw } from 'react-icons/fi';
import WalletBalanceSubinfo from './WalletBalanceSubinfo';
import { useSimulatedIsPoolInitialized } from '../../App/hooks/useSimulatedIsPoolInitialized';
import { fromDisplayQty, toDisplayQty } from '@crocswap-libs/sdk';

interface propsIF {
    tokenAorB: 'A' | 'B';
    token: TokenIF;
    tokenInput: string;
    isTokenEth: boolean;
    isDexSelected: boolean;
    showPulseAnimation: boolean;
    handleTokenInputEvent: (val: string) => void;
    reverseTokens: () => void;
    handleToggleDexSelection: () => void;
    usdValue: number | undefined;
    handleRefresh?: () => void;
    parseTokenInput?: (val: string, isMax?: boolean) => void | string;
    fieldId?: string;
    isLoading?: boolean;
    showWallet?: boolean;
    hideWalletMaxButton?: boolean;
    tokenBalance?: string;
    tokenDexBalance?: string;
    isWithdraw?: boolean;
    disabledContent?: React.ReactNode;
    amountToReduceNativeTokenQty: number;
    isInitPage?: boolean | undefined;
    tokenDecimals?: number;
    percentDiffUsdValue?: number;
}

function TokenInputWithWalletBalance(props: propsIF) {
    const {
        fieldId,
        tokenAorB,
        token,
        tokenInput,
        tokenBalance,
        tokenDexBalance,
        isTokenEth,
        isDexSelected,
        isWithdraw,
        showPulseAnimation,
        isLoading,
        showWallet,
        hideWalletMaxButton,
        disabledContent,
        handleTokenInputEvent,
        reverseTokens,
        handleToggleDexSelection,
        parseTokenInput,
        handleRefresh,
        amountToReduceNativeTokenQty,
        isInitPage,
        usdValue,
        percentDiffUsdValue,
    } = props;

    const usdValueForDom =
        usdValue && parseFloat(tokenInput) > 0
            ? getFormattedNumber({
                  value: usdValue * parseFloat(tokenInput),
                  prefix: '$',
              })
            : '';

    const walletBalanceBigInt = tokenBalance
        ? stringToBigInt(tokenBalance, token.decimals)
        : BigInt(0);

    const dexBalanceBigInt = tokenDexBalance
        ? stringToBigInt(tokenDexBalance, token.decimals)
        : BigInt(0);

    const walletBalanceDisplay = tokenBalance ? tokenBalance : '...';
    const walletAndExchangeBalanceDisplay =
        tokenBalance && tokenDexBalance
            ? (
                  parseFloat(tokenBalance) + parseFloat(tokenDexBalance)
              ).toString()
            : '...';
    const walletAndExchangeBalanceBigInt =
        walletBalanceBigInt + dexBalanceBigInt;
    const balanceDisplay = !isDexSelected
        ? walletBalanceDisplay
        : walletAndExchangeBalanceDisplay;
    const balanceBigInt = !isDexSelected
        ? walletBalanceBigInt
        : walletAndExchangeBalanceBigInt;

    const balanceToDisplay = getFormattedNumber({
        value: parseFloat(balanceDisplay) ?? undefined,
    });

    const subtractBuffer = (balance: bigint) =>
        isTokenEth
            ? balance -
              fromDisplayQty(
                  amountToReduceNativeTokenQty.toString(),
                  token.decimals,
              )
            : isInitPage
              ? balance - BigInt(1e6)
              : balance;

    const balanceWithBuffer = balanceBigInt
        ? subtractBuffer(balanceBigInt)
        : 0n;

    const handleMaxButtonClick = () => {
        if (balanceBigInt.toString() !== tokenInput && balanceWithBuffer > 0n) {
            const scaledValue =
                toDisplayQty(balanceWithBuffer, token.decimals) ?? '0';
            parseTokenInput && parseTokenInput(scaledValue, true);
            handleTokenInputEvent(formatTokenInput(scaledValue, token, true));
        }
    };

    const handleToggleDex = () => {
        // if the sell token quantity is maximized and the user switches to use exchange balance,
        // then the quantity should be updated to the exchange balance maximum
        if (tokenAorB === 'A' && balanceBigInt.toString() !== tokenInput) {
            const balance = subtractBuffer(
                isDexSelected
                    ? walletBalanceBigInt
                    : walletBalanceBigInt + dexBalanceBigInt,
            );
            if (
                walletBalanceBigInt !==
                walletBalanceBigInt + dexBalanceBigInt
            ) {
                const scaledValue =
                    toDisplayQty(balance, token.decimals) ?? '0';
                parseTokenInput && parseTokenInput(scaledValue);
                handleTokenInputEvent(scaledValue);
            }
        }
        handleToggleDexSelection();
    };

    const isPoolInitialized = useSimulatedIsPoolInitialized();

    const walletContent = (
        <>
            <WalletBalanceSubinfo
                usdValueForDom={
                    isLoading ||
                    !usdValueForDom ||
                    disabledContent ||
                    !isPoolInitialized
                        ? ''
                        : usdValueForDom
                }
                percentDiffUsdValue={percentDiffUsdValue}
                showWallet={showWallet}
                isWithdraw={isWithdraw ?? tokenAorB === 'A'}
                balance={balanceToDisplay}
                availableBalance={balanceWithBuffer}
                useExchangeBalance={
                    isDexSelected &&
                    !!tokenDexBalance &&
                    parseFloat(tokenDexBalance) > 0
                }
                isDexSelected={isDexSelected}
                onToggleDex={handleToggleDex}
                onMaxButtonClick={
                    !hideWalletMaxButton ? handleMaxButtonClick : undefined
                }
            />
        </>
    );

    return (
        <>
            <TokenInputQuantity
                fieldId={fieldId}
                token={token}
                tokenAorB={tokenAorB}
                value={tokenInput}
                handleTokenInputEvent={handleTokenInputEvent}
                reverseTokens={reverseTokens}
                isLoading={isLoading}
                includeWallet={walletContent}
                showPulseAnimation={showPulseAnimation}
                disabledContent={disabledContent}
                isPoolInitialized={isPoolInitialized}
            />
            {handleRefresh && (
                <RefreshButton
                    onClick={handleRefresh}
                    aria-label='Refresh data'
                >
                    <FiRefreshCw size={18} />
                </RefreshButton>
            )}
        </>
    );
}

export default memo(TokenInputWithWalletBalance);
