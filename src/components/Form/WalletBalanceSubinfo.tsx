import { useContext } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { getFormattedNumber } from '../../ambient-utils/dataLayer';
import ambientLogo from '../../assets/images/icons/ambient_icon.png';
import walletEnabledIcon from '../../assets/images/icons/wallet-enabled.svg';
import walletIcon from '../../assets/images/icons/wallet.svg';
import { AppStateContext } from '../../contexts/AppStateContext';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';
import { FlexContainer } from '../../styled/Common';
import { MaxButton } from '../../styled/Components/Portfolio';
import IconWithTooltip from '../Global/IconWithTooltip/IconWithTooltip';
import ExchangeBalanceExplanation from '../Global/Informational/ExchangeBalanceExplanation';
import WalletBalanceExplanation from '../Global/Informational/WalletBalanceExplanation';
import { DefaultTooltip } from '../Global/StyledTooltip/StyledTooltip';
interface PropsIF {
    usdValueForDom: string;
    showWallet: boolean | undefined;
    isWithdraw: boolean;
    balance: string;
    useExchangeBalance: boolean;
    isDexSelected: boolean;
    onToggleDex: () => void;
    availableBalance?: bigint;
    onMaxButtonClick?: () => void;
    percentDiffUsdValue: number | undefined;
}
export default function WalletBalanceSubinfo(props: PropsIF) {
    const {
        usdValueForDom,
        percentDiffUsdValue,
        showWallet,
        isWithdraw,
        balance,
        availableBalance,
        useExchangeBalance,
        isDexSelected,
        onToggleDex,
        onMaxButtonClick,
    } = props;

    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);
    const { fastLaneProtection } = useContext(UserPreferenceContext);

    // const walletEnabledIcon = (
    //     <svg
    //         width='17'
    //         height='15'
    //         viewBox='0 0 17 15'
    //         fill='none'
    //         xmlns='http://www.w3.org/2000/svg'
    //         style={{ stroke: 'var(--accent1)' }} // Use CSS variable here
    //     >
    //         <path
    //             d='M14.6666 7.50001V4.16668H2.99992C2.55789 4.16668 2.13397 3.99108 1.82141 3.67852C1.50885 3.36596 1.33325 2.94204 1.33325 2.50001M1.33325 2.50001C1.33325 1.58334 2.08325 0.833344 2.99992 0.833344H12.9999V4.16668M1.33325 2.50001V12.5C1.33325 13.4167 2.08325 14.1667 2.99992 14.1667H14.6666V10.8333M12.9999 7.50001C12.5579 7.50001 12.134 7.67561 11.8214 7.98817C11.5088 8.30073 11.3333 8.72465 11.3333 9.16668C11.3333 10.0833 12.0833 10.8333 12.9999 10.8333H16.3333V7.50001H12.9999Z'
    //             strokeLinecap='round'
    //             strokeLinejoin='round'
    //         />
    //     </svg>
    // );

    const walletWithTooltip =
        isWithdraw || !isDexSelected ? (
            <IconWithTooltip
                title={`${
                    isWithdraw
                        ? 'Use Wallet Balance Only'
                        : 'Withdraw to Wallet'
                }`}
                placement='bottom'
            >
                <div
                    style={
                        !isWithdraw
                            ? { paddingTop: '2px', cursor: 'default' }
                            : { paddingTop: '2px', cursor: 'pointer' }
                    }
                    onClick={!isWithdraw ? undefined : onToggleDex}
                >
                    <img
                        src={!isDexSelected ? walletEnabledIcon : walletIcon}
                        width='20'
                    />
                </div>
            </IconWithTooltip>
        ) : null;

    const exchangeWithTooltip =
        isWithdraw || isDexSelected ? (
            <IconWithTooltip
                title={
                    fastLaneProtection?.isEnabled
                        ? 'Exchange Balance disabled with MEV Protection'
                        : isWithdraw
                          ? 'Use Wallet and Exchange Balance'
                          : 'Send to Exchange Balance'
                }
                placement='right'
            >
                <div
                    style={{
                        padding: '2px 4px 0 4px',
                        filter: !isDexSelected
                            ? 'grayscale(100%)'
                            : 'contrast(1) brightness(1) saturate(1)',
                        cursor: isWithdraw ? 'pointer' : 'default',
                        opacity: fastLaneProtection?.isEnabled ? 0.5 : 1,
                    }}
                    onClick={onToggleDex}
                >
                    <img src={ambientLogo} width='20' alt='surplus' />
                </div>
            </IconWithTooltip>
        ) : null;

    const walletPriceWithTooltip = (
        <DefaultTooltip
            title={
                isDexSelected ? (
                    <p
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                        }}
                        onClick={() =>
                            openGlobalPopup(
                                <ExchangeBalanceExplanation />,
                                'Exchange Balance',
                                'right',
                            )
                        }
                    >
                        {isWithdraw
                            ? (
                                  availableBalance !== undefined
                                      ? availableBalance > 0
                                      : parseFloat(balance) > 0
                              )
                                ? 'Use Maximum Wallet + Exchange Balance'
                                : 'Wallet + Exchange Balance'
                            : 'Wallet + Exchange Balance'}
                        <AiOutlineQuestionCircle size={14} />
                    </p>
                ) : (
                    <p
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                        }}
                        onClick={() =>
                            openGlobalPopup(
                                <WalletBalanceExplanation />,
                                'Wallet Balance',
                                'right',
                            )
                        }
                    >
                        {!isWithdraw
                            ? 'Wallet Balance'
                            : (
                                    availableBalance
                                        ? availableBalance > 0
                                        : parseFloat(balance) > 0
                                )
                              ? 'Use Maximum Wallet Balance'
                              : 'Wallet Balance'}
                        <AiOutlineQuestionCircle size={14} />
                    </p>
                )
            }
            placement={'left'}
            arrow
            enterDelay={700}
            leaveDelay={200}
        >
            <FlexContainer
                flexDirection='column'
                color='text1'
                style={
                    onMaxButtonClick && parseFloat(balance) > 0
                        ? { cursor: 'pointer' }
                        : { cursor: 'default' }
                }
                onClick={() => {
                    parseFloat(balance) > 0 &&
                        onMaxButtonClick &&
                        onMaxButtonClick();
                }}
            >
                <div>{balance}</div>
            </FlexContainer>
        </DefaultTooltip>
    );

    const maxButtonWithTooltip = (
        <DefaultTooltip
            title={
                <p
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                    }}
                    onClick={() => {
                        useExchangeBalance
                            ? openGlobalPopup(
                                  <ExchangeBalanceExplanation />,
                                  'Exchange Balance',
                                  'right',
                              )
                            : openGlobalPopup(
                                  <WalletBalanceExplanation />,
                                  'Wallet Balance',
                                  'right',
                              );
                    }}
                >
                    {useExchangeBalance
                        ? 'Use Maximum Wallet + Exchange Balance'
                        : 'Use Maximum Wallet Balance'}
                    <AiOutlineQuestionCircle size={14} />
                </p>
            }
            placement={'bottom'}
            arrow
            enterDelay={700}
            leaveDelay={200}
        >
            <MaxButton width='25px' onClick={onMaxButtonClick}>
                Max
            </MaxButton>
        </DefaultTooltip>
    );
    const showWarning =
        usdValueForDom &&
        percentDiffUsdValue !== undefined &&
        percentDiffUsdValue < -10;

    const formattedUsdDifference =
        percentDiffUsdValue !== undefined
            ? getFormattedNumber({
                  value: percentDiffUsdValue,
                  isPercentage: true,
              }) + '%'
            : undefined;

    return (
        <FlexContainer
            fullWidth
            alignItems='center'
            justifyContent='space-between'
            gap={4}
            fontSize='body'
            color='text2'
            cursor='default'
        >
            <p style={showWarning ? { color: 'var(--other-red)' } : undefined}>
                {showWarning
                    ? `${usdValueForDom} ${' '}(${formattedUsdDifference})`
                    : usdValueForDom}
            </p>
            {showWallet && (
                <FlexContainer
                    role='button'
                    flexDirection='row'
                    alignItems='center'
                    gap={8}
                    fontSize='body'
                    style={{
                        marginRight: isWithdraw || isDexSelected ? '0' : '4px',
                    }}
                >
                    {walletPriceWithTooltip}
                    {onMaxButtonClick &&
                        availableBalance !== undefined &&
                        availableBalance > 0 &&
                        maxButtonWithTooltip}
                    {walletWithTooltip}
                    {exchangeWithTooltip}
                </FlexContainer>
            )}
        </FlexContainer>
    );
}
