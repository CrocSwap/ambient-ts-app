import { memo } from 'react';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
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
    parseTokenInput?: (val: string, isMax?: boolean) => void | string;
    fieldId?: string;
    isLoading?: boolean;
    showWallet?: boolean;
    hideWalletMaxButton?: boolean;
    tokenBalance?: string;
    tokenDexBalance?: string;
    isWithdraw?: boolean;
    disabledContent?: React.ReactNode;
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
    const balanceToDisplay = getFormattedNumber({
        value: parseFloat(balance) ?? undefined,
    });

    const subtractBuffer = (balance: string) =>
        isTokenEth ? (parseFloat(balance) - ETH_BUFFER).toFixed(18) : balance;

    const balanceWithBuffer = balance ? subtractBuffer(balance) : '...';

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
        if (formatTokenInput(balanceWithBuffer, token) === tokenInput) {
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
            disabledContent={disabledContent}
        />
    );
}

export default memo(TokenInput);
