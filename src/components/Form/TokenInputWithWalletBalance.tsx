import { getFormattedNumber } from '../../ambient-utils/dataLayer';
import { TokenIF } from '../../ambient-utils/types';
import {
    memo,
    // useContext
} from 'react';
import { formatTokenInput, stringToBigInt } from '../../utils/numbers';
import TokenInputQuantity from './TokenInputQuantity';
import { RefreshButton } from '../../styled/Components/TradeModules';
import { FiRefreshCw } from 'react-icons/fi';
import WalletBalanceSubinfo from './WalletBalanceSubinfo';
import { useSimulatedIsPoolInitialized } from '../../App/hooks/useSimulatedIsPoolInitialized';

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

    const toDecimal = (val: string) =>
        isTokenEth ? parseFloat(val).toFixed(18) : parseFloat(val).toString();

    const walletBalanceBigInt = tokenBalance
        ? stringToBigInt(tokenBalance, token.decimals)
        : BigInt(0);
    const dexBalanceBigInt = tokenDexBalance
        ? stringToBigInt(tokenDexBalance, token.decimals)
        : BigInt(0);

    const walletBalance = tokenBalance ? toDecimal(tokenBalance) : '...';

    const walletAndExchangeBalance =
        tokenBalance && tokenDexBalance
            ? toDecimal(
                  (
                      parseFloat(tokenBalance) + parseFloat(tokenDexBalance)
                  ).toString(),
              )
            : '...';
    const walletAndExchangeBalanceBigInt =
        walletBalanceBigInt + dexBalanceBigInt;
    const balance = !isDexSelected ? walletBalance : walletAndExchangeBalance;
    const balanceBigInt = !isDexSelected
        ? walletBalanceBigInt
        : walletAndExchangeBalanceBigInt;

    const balanceBigIntString = balanceBigInt.toString();

    // function to insert character at index from end of string
    const insertCharAt = (str: string, index: number, char: string) =>
        str.slice(0, -index) + char + str.slice(-index);

    const balBigIntStringScaled = insertCharAt(
        balanceBigIntString.padStart(token.decimals, '0'),
        token.decimals,
        '.',
    );

    const balanceToDisplay = getFormattedNumber({
        value: parseFloat(balance) ?? undefined,
    });

    const subtractBuffer = (balance: string) =>
        isTokenEth
            ? (parseFloat(balance) - amountToReduceNativeTokenQty).toFixed(18)
            : isInitPage
              ? (parseFloat(balance) - 1e-12).toFixed(token.decimals)
              : balance;

    const balanceWithBuffer = balance
        ? subtractBuffer(balBigIntStringScaled)
        : '...';

    const handleMaxButtonClick = () => {
        if (
            formatTokenInput(balanceWithBuffer, token, true) !== tokenInput &&
            parseFloat(balanceWithBuffer) > 0
        ) {
            parseTokenInput && parseTokenInput(balanceWithBuffer, true);
            handleTokenInputEvent(
                formatTokenInput(balanceWithBuffer, token, true),
            );
        }
    };

    const handleToggleDex = () => {
        // if the sell token quantity is maximized and the user switches to use exchange balance,
        // then the quantity should be updated to the exchange balance maximum
        if (
            tokenAorB === 'A' &&
            parseFloat(formatTokenInput(balanceWithBuffer, token)) ===
                parseFloat(tokenInput)
        ) {
            const balance = subtractBuffer(
                isDexSelected ? walletBalance : walletAndExchangeBalance,
            );
            if (walletBalance !== walletAndExchangeBalance) {
                parseTokenInput && parseTokenInput(balance);
                handleTokenInputEvent(balance);
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
                availableBalance={parseFloat(balanceWithBuffer)}
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
                walletBalance={walletBalance}
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
