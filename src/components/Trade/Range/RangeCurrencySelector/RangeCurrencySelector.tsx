import { ChangeEvent, Dispatch, memo, SetStateAction, useContext } from 'react';
import styles from './RangeCurrencySelector.module.css';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import ambientLogo from '../../../../assets/images/icons/ambient_icon.png';
import walletIcon from '../../../../assets/images/icons/wallet.svg';
import walletEnabledIcon from '../../../../assets/images/icons/wallet-enabled.svg';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import ExchangeBalanceExplanation from '../../../Global/Informational/ExchangeBalanceExplanation';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { IS_LOCAL_ENV } from '../../../../constants';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import TokenInput from '../../../Global/TokenInput/TokenInput';

interface propsIF {
    fieldId: string;
    isTokenAEth: boolean;
    isTokenBEth: boolean;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
    isWithdrawTokenAFromDexChecked: boolean;
    setIsWithdrawTokenAFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isWithdrawTokenBFromDexChecked: boolean;
    setIsWithdrawTokenBFromDexChecked: Dispatch<SetStateAction<boolean>>;
    reverseTokens: () => void;
    tokenAInputQty: string;
    tokenBInputQty: string;
    tokenABalance: string;
    tokenBBalance: string;
    tokenADexBalance: string;
    tokenBDexBalance: string;
    isTokenADisabled: boolean;
    isTokenBDisabled: boolean;
    isAdvancedMode: boolean;
    disable?: boolean;
    handleChangeClick: (input: string) => void;
    tokenAorB: string;
    setUserOverrodeSurplusWithdrawalDefault: Dispatch<SetStateAction<boolean>>;
    parseInput: (value: string) => void;
}

function RangeCurrencySelector(props: propsIF) {
    const {
        isTokenAEth,
        isTokenBEth,
        isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked,
        fieldId,
        updateOtherQuantity,
        reverseTokens,
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenAInputQty,
        tokenBInputQty,
        tokenBDexBalance,
        isAdvancedMode,
        handleChangeClick,
        tokenAorB,
        setUserOverrodeSurplusWithdrawalDefault,
        parseInput,
    } = props;

    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { showRangePulseAnimation } = useContext(TradeTableContext);

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );
    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

    const isTokenASelector = fieldId === 'A';

    const walletAndSurplusBalanceNonLocaleString = isTokenASelector
        ? tokenADexBalance && gasPriceInGwei
            ? isTokenAEth
                ? (
                      parseFloat(tokenADexBalance) +
                      parseFloat(tokenABalance) -
                      gasPriceInGwei * 500000 * 1e-9
                  ).toFixed(18)
                : (
                      parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                  ).toString()
            : ''
        : tokenBDexBalance && gasPriceInGwei
        ? isTokenBEth
            ? (
                  parseFloat(tokenBDexBalance) +
                  parseFloat(tokenBBalance) -
                  gasPriceInGwei * 500000 * 1e-9
              ).toFixed(18)
            : (
                  parseFloat(tokenBDexBalance) + parseFloat(tokenBBalance)
              ).toString()
        : '';

    const walletAndSurplusBalanceLocaleString = isTokenASelector
        ? tokenADexBalance
            ? (
                  parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
              ).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '...'
        : tokenBDexBalance
        ? (
              parseFloat(tokenBDexBalance) + parseFloat(tokenBBalance)
          ).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

    const walletBalanceNonLocaleString = isTokenASelector
        ? tokenABalance && gasPriceInGwei
            ? isTokenAEth
                ? (
                      parseFloat(tokenABalance) -
                      gasPriceInGwei * 500000 * 1e-9
                  ).toFixed(18)
                : tokenABalance
            : ''
        : tokenBBalance && gasPriceInGwei
        ? isTokenBEth
            ? (
                  parseFloat(tokenBBalance) -
                  gasPriceInGwei * 500000 * 1e-9
              ).toFixed(18)
            : tokenBBalance
        : '';

    const walletBalanceLocaleString = isTokenASelector
        ? tokenABalance
            ? parseFloat(tokenABalance).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '...'
        : tokenBBalance
        ? parseFloat(tokenBBalance).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

    const balanceLocaleString =
        (isTokenASelector && !isWithdrawTokenAFromDexChecked) ||
        (!isTokenASelector && !isWithdrawTokenBFromDexChecked)
            ? walletBalanceLocaleString
            : walletAndSurplusBalanceLocaleString;

    const balanceNonLocaleString =
        (isTokenASelector && !isWithdrawTokenAFromDexChecked) ||
        (!isTokenASelector && !isWithdrawTokenBFromDexChecked)
            ? walletBalanceNonLocaleString
            : walletAndSurplusBalanceNonLocaleString;

    const shouldDisplayMaxButton = balanceLocaleString !== '0.00';

    function handleMaxButtonClick() {
        if (handleChangeClick && isUserConnected && shouldDisplayMaxButton) {
            handleChangeClick(balanceNonLocaleString);
        }
    }

    const maxButton = shouldDisplayMaxButton ? (
        <button
            className={`${styles.max_button} ${styles.max_button_enable}`}
            onClick={() => {
                handleMaxButtonClick();
                IS_LOCAL_ENV &&
                    console.debug(
                        'max button clicked with value: ' +
                            balanceNonLocaleString,
                    );
            }}
        >
            Max
        </button>
    ) : (
        <p className={styles.max_button} />
    );

    const exchangeBalanceTitle = (
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
            Wallet + Exchange Balance <AiOutlineQuestionCircle size={14} />
        </p>
    );

    const walletContent = (
        <div className={styles.main_wallet_container}>
            <IconWithTooltip
                title={`${
                    tokenAorB === 'A'
                        ? 'Use Wallet Balance Only'
                        : 'Withdraw to Wallet'
                }`}
                placement='bottom'
            >
                <div
                    className={styles.balance_with_pointer}
                    onClick={() => {
                        if (isTokenASelector) {
                            setIsWithdrawTokenAFromDexChecked(false);
                            if (
                                !!tokenADexBalance &&
                                parseFloat(tokenADexBalance) > 0
                            ) {
                                setUserOverrodeSurplusWithdrawalDefault(true);
                            }
                        } else {
                            setIsWithdrawTokenBFromDexChecked(false);
                            if (
                                !!tokenBDexBalance &&
                                parseFloat(tokenBDexBalance) > 0
                            ) {
                                setUserOverrodeSurplusWithdrawalDefault(true);
                            }
                        }
                    }}
                >
                    <div className={`${styles.wallet_logo}`}>
                        <img
                            src={
                                (isTokenASelector &&
                                    !isWithdrawTokenAFromDexChecked) ||
                                (!isTokenASelector &&
                                    !isWithdrawTokenBFromDexChecked)
                                    ? walletEnabledIcon
                                    : walletIcon
                            }
                            width='20'
                        />
                    </div>
                </div>
            </IconWithTooltip>
            <IconWithTooltip
                title={`${
                    tokenAorB === 'A'
                        ? 'Use  Wallet and Exchange Balance'
                        : 'Add to Exchange Balance'
                }`}
                placement='bottom'
            >
                <div
                    className={`${styles.balance_with_pointer}  ${
                        isTokenASelector
                            ? isWithdrawTokenAFromDexChecked
                                ? styles.enabled_logo
                                : styles.grey_logo
                            : isWithdrawTokenBFromDexChecked
                            ? styles.enabled_logo
                            : styles.grey_logo
                    }`}
                    onClick={() => {
                        if (isTokenASelector) {
                            setIsWithdrawTokenAFromDexChecked(true);
                        } else {
                            setIsWithdrawTokenBFromDexChecked(true);
                        }
                    }}
                >
                    <div className={`${styles.wallet_logo}`}>
                        <img src={ambientLogo} width='20' alt='surplus' />
                    </div>
                </div>
            </IconWithTooltip>{' '}
            <DefaultTooltip
                interactive
                title={exchangeBalanceTitle}
                placement={'bottom'}
                arrow
                enterDelay={100}
                leaveDelay={200}
            >
                <div
                    className={styles.balance_column}
                    style={{ cursor: 'default' }}
                >
                    <div>{isUserConnected ? balanceLocaleString : ''}</div>
                </div>
            </DefaultTooltip>
            {maxButton}
        </div>
    );

    const swapboxBottomOrNull = !isUserConnected ? (
        <div className={styles.swapbox_bottom} />
    ) : (
        <div className={styles.swapbox_bottom}>{walletContent}</div>
    );

    return (
        <TokenInput
            fieldId={fieldId}
            token={isTokenASelector ? tokenA : tokenB}
            tokenAorB={tokenAorB}
            value={tokenAorB === 'A' ? tokenAInputQty : tokenBInputQty}
            handleChangeEvent={updateOtherQuantity}
            reverseTokens={reverseTokens}
            includeWallet={swapboxBottomOrNull}
            disabledContent={
                <div className={styles.overlay_container}>
                    <div className={styles.disabled_text}>
                        The market is outside your specified range.
                        <div className={styles.warning_text}>
                            Single-asset deposit only.
                        </div>
                    </div>
                </div>
            }
            isAdvancedMode={isAdvancedMode}
            parseInput={parseInput}
            showPulseAnimation={showRangePulseAnimation}
        />
    );
}

export default memo(RangeCurrencySelector);
