import ambientLogo from '../../assets/images/icons/ambient_icon.png';
import walletIcon from '../../assets/images/icons/wallet.svg';
import walletEnabledIcon from '../../assets/images/icons/wallet-enabled.svg';
import { useContext } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { AppStateContext } from '../../contexts/AppStateContext';
import IconWithTooltip from '../Global/IconWithTooltip/IconWithTooltip';
import ExchangeBalanceExplanation from '../Global/Informational/ExchangeBalanceExplanation';
import WalletBalanceExplanation from '../Global/Informational/WalletBalanceExplanation';
import { DefaultTooltip } from '../Global/StyledTooltip/StyledTooltip';
import { FlexContainer } from '../../styled/Common';
import { MaxButton } from '../../styled/Components/Portfolio';
interface PropsIF {
    usdValueForDom: string;
    showWallet: boolean | undefined;
    isWithdraw: boolean;
    balance: string;
    useExchangeBalance: boolean;
    isDexSelected: boolean;
    onToggleDex: () => void;
    availableBalance?: number;
    onMaxButtonClick?: () => void;
    onRefresh?: () => void;
}
export default function WalletBalanceSubinfo(props: PropsIF) {
    const {
        usdValueForDom,
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

    const walletWithTooltip = (
        <IconWithTooltip
            title={`${
                isWithdraw ? 'Use Wallet Balance Only' : 'Withdraw to Wallet'
            }`}
            placement='bottom'
        >
            <div
                style={{ paddingTop: '2px', cursor: 'pointer' }}
                onClick={onToggleDex}
            >
                <img
                    src={!isDexSelected ? walletEnabledIcon : walletIcon}
                    width='20'
                />
            </div>
        </IconWithTooltip>
    );

    const exchangeWithTooltip = (
        <IconWithTooltip
            title={`${
                isWithdraw
                    ? 'Use Wallet and Exchange Balance'
                    : 'Add to Exchange Balance'
            }`}
            placement='bottom'
        >
            <div
                style={{
                    padding: '2px 4px 0 4px',
                    filter: !isDexSelected
                        ? 'grayscale(100%)'
                        : 'contrast(1) brightness(1) saturate(1)',
                    cursor: 'pointer',
                }}
                onClick={onToggleDex}
            >
                <img src={ambientLogo} width='20' alt='surplus' />
            </div>
        </IconWithTooltip>
    );

    const walletPriceWithTooltip = (
        <DefaultTooltip
            interactive
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
                                  availableBalance
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
            placement={'bottom'}
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
            interactive
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

    return (
        <FlexContainer
            fullWidth
            alignItems='center'
            justifyContent='space-between'
            gap={4}
            fontSize='body'
            color='text2'
        >
            <p>{usdValueForDom}</p>
            {showWallet && (
                <FlexContainer
                    role='button'
                    flexDirection='row'
                    alignItems='center'
                    gap={8}
                    fontSize='body'
                >
                    {walletPriceWithTooltip}
                    {onMaxButtonClick &&
                        parseFloat(balance) > 0 &&
                        maxButtonWithTooltip}
                    {walletWithTooltip}
                    {exchangeWithTooltip}
                </FlexContainer>
            )}

            {/* {onRefresh && (
                <RefreshButton onClick={onRefresh} aria-label='Refresh data'>
                    <FiRefreshCw size={18} />
                </RefreshButton>
            )} */}
        </FlexContainer>
    );
}
