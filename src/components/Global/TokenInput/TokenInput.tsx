import { memo, useEffect } from 'react';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { formatTokenInput } from '../../../utils/numbers';
import TokenInputQuantity from './TokenInputQuantity';
import { TokenInputWalletBalance } from './TokenInputWalletBalance';

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
    handleRefresh?: () => void;
    parseTokenInput?: (val: string) => void | string;
    fieldId?: string;
    isLoading?: boolean;
    showWallet?: boolean;
    hideWalletMaxButton?: boolean;
    tokenBalance?: string;
    tokenDexBalance?: string;
}

function TokenInput(props: propsIF) {
    const {
        fieldId,
        tokenAorB,
        token,
        tokenInput,
        tokenBalance,
        tokenDexBalance,
        isTokenEth,
        isDexSelected,
        showPulseAnimation,
        isLoading,
        showWallet,
        hideWalletMaxButton,
        handleTokenInputEvent,
        reverseTokens,
        handleToggleDexSelection,
        parseTokenInput,
        handleRefresh,
    } = props;

    const ETH_BUFFER = 0.025;

    const toDecimal = (val: string) =>
        isTokenEth ? parseFloat(val).toFixed(18) : parseFloat(val).toString();

    const walletBalance = tokenBalance ? toDecimal(tokenBalance) : '...';
    const walletAndExchangeBalance =
        tokenBalance && tokenDexBalance
            ? toDecimal(
                  (
                      parseFloat(tokenBalance) + parseFloat(tokenDexBalance)
                  ).toString(),
              )
            : '...';
    const balance = !isDexSelected ? walletBalance : walletAndExchangeBalance;
    const balanceToDisplay = parseFloat(balance).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const subtractBuffer = (balance: string) =>
        isTokenEth ? (parseFloat(balance) - ETH_BUFFER).toFixed(18) : balance;

    const balanceWithBuffer = subtractBuffer(balance);

    const handleMaxButtonClick = () => {
        if (formatTokenInput(balanceWithBuffer, token) !== tokenInput) {
            parseTokenInput && parseTokenInput(balanceWithBuffer);
            handleTokenInputEvent(balanceWithBuffer);
        }
    };

    const handleToggleDex = () => {
        if (formatTokenInput(balanceWithBuffer) === tokenInput) {
            const balance = subtractBuffer(
                isDexSelected ? walletBalance : walletAndExchangeBalance,
            );
            parseTokenInput && parseTokenInput(balance);
            handleTokenInputEvent(balance);
        }
        handleToggleDexSelection();
    };

    const walletContent = showWallet && (
        <TokenInputWalletBalance
            tokenAorB={tokenAorB}
            balance={balanceToDisplay ?? ''}
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
            onRefresh={handleRefresh}
        />
    );

    return (
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
            parseInput={parseTokenInput}
        />
    );
}

export default memo(TokenInput);
