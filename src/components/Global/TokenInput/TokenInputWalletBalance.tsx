import styles from './TokenInputWalletBalance.module.css';
import ambientLogo from '../../../assets/images/icons/ambient_icon.png';
import walletIcon from '../../../assets/images/icons/wallet.svg';
import walletEnabledIcon from '../../../assets/images/icons/wallet-enabled.svg';
import { useContext } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { FiRefreshCw } from 'react-icons/fi';
import { AppStateContext } from '../../../contexts/AppStateContext';
import IconWithTooltip from '../IconWithTooltip/IconWithTooltip';
import ExchangeBalanceExplanation from '../Informational/ExchangeBalanceExplanation';
import WalletBalanceExplanation from '../Informational/WalletBalanceExplanation';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';

interface PropsIF {
    tokenAorB: 'A' | 'B';
    balance: string;
    useExchangeBalance: boolean;
    isDexSelected: boolean;
    onToggleDex: () => void;
    availableBalance?: number;
    onMaxButtonClick?: () => void;
    onRefresh?: () => void;
}

export const TokenInputWalletBalance = (props: PropsIF) => {
    const {
        tokenAorB,
        balance,
        availableBalance,
        useExchangeBalance,
        isDexSelected,
        onToggleDex,
        onMaxButtonClick,
        onRefresh,
    } = props;

    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);

    const sellTokenLogoClassname = !isDexSelected
        ? styles.grey_logo
        : styles.enabled_logo;

    return (
        <section className={styles.wallet_container}>
            <div className={`${styles.balance_with_pointer}`}>
                <IconWithTooltip
                    title={`${
                        tokenAorB === 'A'
                            ? 'Use Wallet Balance Only'
                            : 'Withdraw to Wallet'
                    }`}
                    placement='bottom'
                >
                    <div
                        className={`${styles.wallet_logo}`}
                        onClick={onToggleDex}
                    >
                        <img
                            src={
                                !isDexSelected ? walletEnabledIcon : walletIcon
                            }
                            width='20'
                        />
                    </div>
                </IconWithTooltip>
                <IconWithTooltip
                    title={`${
                        tokenAorB === 'A'
                            ? 'Use Wallet and Exchange Balance'
                            : 'Add to Exchange Balance'
                    }`}
                    placement='bottom'
                >
                    <div
                        className={`${styles.ambient_logo} ${sellTokenLogoClassname}`}
                        onClick={onToggleDex}
                    >
                        <img src={ambientLogo} width='20' alt='surplus' />
                    </div>
                </IconWithTooltip>
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
                                {tokenAorB === 'A'
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
                                {tokenAorB === 'B'
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
                    <div
                        className={styles.balance_column}
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
                    </div>
                </DefaultTooltip>
                {onMaxButtonClick && parseFloat(balance) > 0 && (
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
                        <button
                            className={`${styles.max_button} ${styles.max_button_enable}`}
                            onClick={onMaxButtonClick}
                        >
                            Max
                        </button>
                    </DefaultTooltip>
                )}
            </div>
            {onRefresh && (
                <button
                    onClick={onRefresh}
                    className={styles.refresh_button}
                    aria-label='Refresh data'
                >
                    <FiRefreshCw size={18} />
                </button>
            )}
        </section>
    );
};
