import { memo } from 'react';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
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
    parseTokenInput?: (val: string) => void;
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

    const balance =
        tokenBalance && tokenDexBalance
            ? !isDexSelected
                ? toDecimal(tokenBalance)
                : toDecimal(
                      (
                          parseFloat(tokenBalance) + parseFloat(tokenDexBalance)
                      ).toString(),
                  )
            : '...';

    const balanceToDisplay = parseFloat(balance).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const balanceWithBuffer = isTokenEth
        ? (parseFloat(balance) - ETH_BUFFER).toFixed(18)
        : balance;

    function handleMaxButtonClick() {
        handleTokenInputEvent(balanceWithBuffer);
    }

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
            onToggleDex={handleToggleDexSelection}
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
