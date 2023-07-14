import { memo } from 'react';
import { TokenInputWalletBalance } from '../../Global/TokenInput/TokenInputWalletBalance';
import TokenInputQuantity from '../../Global/TokenInput/TokenInputQuantity';
import { TokenIF } from '../../../utils/interfaces/TokenIF';

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
    parseTokenInput: (val: string) => void;
    handleRefresh?: () => void;
    isLoading?: boolean;
    showWallet?: boolean;
    tokenBalance?: string;
    tokenDexBalance?: string;
}

function TokenInput(props: propsIF) {
    const {
        tokenAorB,
        token,
        tokenInput,
        tokenBalance,
        tokenDexBalance,
        isTokenEth,
        isDexSelected,
        isLoading,
        showPulseAnimation,
        handleTokenInputEvent,
        reverseTokens,
        handleToggleDexSelection,
        parseTokenInput,
        handleRefresh,
        showWallet,
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
            onMaxButtonClick={handleMaxButtonClick}
            onRefresh={handleRefresh}
        />
    );

    return (
        <TokenInputQuantity
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
