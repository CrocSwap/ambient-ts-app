import TokenInput from '../../../components/Global/TokenInput/TokenInput';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { LocalPairDataIF } from '../../../utils/state/localPairDataSlice';

export default function InitTokenInput() {
    const localPair: LocalPairDataIF = useAppSelector(
        (state) => state.localPairData,
    );
    const [tokenA, tokenB] = localPair.tokens;
    const baseToken = tokenA;
    const quoteToken = tokenB;

    return (
        <section>
            <TokenInput
                fieldId='range_A'
                tokenAorB='A'
                token={tokenA}
                tokenInput={tokenAInputQty}
                tokenBalance={tokenABalance}
                tokenDexBalance={tokenADexBalance}
                isTokenEth={isTokenAEth}
                isDexSelected={isWithdrawTokenAFromDexChecked}
                showPulseAnimation={showRangePulseAnimation}
                handleTokenInputEvent={handleTokenAChangeEvent}
                reverseTokens={reverseTokens}
                handleToggleDexSelection={() => toggleDexSelection('A')}
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setTokenAInputQty(formatTokenInput(val, tokenA, isMax));
                }}
                showWallet={isUserConnected}
                disabledContent={
                    isTokenAInputDisabled ? disabledContent : undefined
                }
            />
            <div className={styles.operation_container}>
                <img
                    className={styles.inactive}
                    src={tokenArrow}
                    height={28}
                    alt='plus sign'
                />
            </div>
            <TokenInput
                fieldId='range_B'
                tokenAorB='B'
                token={tokenB}
                tokenInput={tokenBInputQty}
                tokenBalance={tokenBBalance}
                tokenDexBalance={tokenBDexBalance}
                isTokenEth={isTokenBEth}
                isDexSelected={isWithdrawTokenBFromDexChecked}
                showPulseAnimation={showRangePulseAnimation}
                handleTokenInputEvent={handleTokenBChangeEvent}
                reverseTokens={reverseTokens}
                handleToggleDexSelection={() => toggleDexSelection('B')}
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setTokenBInputQty(formatTokenInput(val, tokenB, isMax));
                }}
                showWallet={isUserConnected}
                disabledContent={
                    isTokenBInputDisabled ? disabledContent : undefined
                }
                isWithdraw
            />
        </section>
    );
}
