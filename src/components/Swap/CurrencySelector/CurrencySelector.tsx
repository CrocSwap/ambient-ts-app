import styles from './CurrencySelector.module.css';
import CurrencyQuantity from '../CurrencyQuantity/CurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';

import {
    useState,
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useEffect,
    useContext,
    memo,
} from 'react';
import ambientLogo from '../../../assets/images/icons/ambient_icon.png';
import walletIcon from '../../../assets/images/icons/wallet.svg';
import walletEnabledIcon from '../../../assets/images/icons/wallet-enabled.svg';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import { SoloTokenSelectModal } from '../../Global/TokenSelectContainer/SoloTokenSelectModal';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import ExchangeBalanceExplanation from '../../Global/Informational/ExchangeBalanceExplanation';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import WalletBalanceExplanation from '../../Global/Informational/WalletBalanceExplanation';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { FiRefreshCw } from 'react-icons/fi';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { useModal } from '../../Global/Modal/useModal';

interface propsIF {
    disableReverseTokens: boolean;
    fieldId: string;
    tokenAorB: string | null;
    sellToken?: boolean;
    sellQtyString: string;
    setSellQtyString: Dispatch<SetStateAction<string>>;
    buyQtyString: string;
    setBuyQtyString: Dispatch<SetStateAction<string>>;
    tokenABalance: string;
    tokenBBalance: string;
    tokenADexBalance: string;
    tokenBDexBalance: string;
    isSellTokenEth?: boolean;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: Dispatch<SetStateAction<boolean>>;
    setIsSellLoading: Dispatch<SetStateAction<boolean>>;
    setIsBuyLoading: Dispatch<SetStateAction<boolean>>;
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    handleChangeEvent: (evt?: ChangeEvent<HTMLInputElement>) => void;
    handleChangeClick?: (value: string) => void;
    reverseTokens: () => void;
    setDisableReverseTokens: Dispatch<SetStateAction<boolean>>;
    setUserOverrodeSurplusWithdrawalDefault: Dispatch<SetStateAction<boolean>>;
    setUserClickedCombinedMax: Dispatch<SetStateAction<boolean>>;
    userClickedCombinedMax: boolean;
    isLoading: boolean;
    handleTokenAChangeEvent?: (
        evt?: ChangeEvent<HTMLInputElement>,
    ) => Promise<void>;
    handleTokenBChangeEvent?: (
        evt?: ChangeEvent<HTMLInputElement>,
    ) => Promise<void>;
    isTokenAPrimaryLocal?: boolean;
}

function CurrencySelector(props: propsIF) {
    const {
        setDisableReverseTokens,
        sellQtyString,
        setSellQtyString,
        buyQtyString,
        setBuyQtyString,
        fieldId,
        tokenAorB,
        handleChangeEvent,
        handleChangeClick,
        handleTokenAChangeEvent,
        handleTokenBChangeEvent,
        isTokenAPrimaryLocal,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        isSellTokenEth,
        reverseTokens,
        setUserOverrodeSurplusWithdrawalDefault,
        setUserClickedCombinedMax,
        userClickedCombinedMax,
        setIsSellLoading,
        setIsBuyLoading,
        isLoading,
    } = props;

    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);
    const { showSwapPulseAnimation } = useContext(TradeTableContext);
    const { dexBalSwap } = useContext(UserPreferenceContext);

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );
    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

    const isSellTokenSelector = fieldId === 'sell';
    const thisToken = isSellTokenSelector ? tokenA : tokenB;

    const displayAmountToReduceEth = 0.2;

    const walletBalanceNonLocaleString = props.sellToken
        ? tokenABalance
            ? isSellTokenEth
                ? parseFloat(tokenABalance).toFixed(18)
                : tokenABalance
            : ''
        : tokenBBalance
        ? tokenBBalance
        : '';

    const walletBalanceLocaleString = props.sellToken
        ? tokenABalance
            ? parseFloat(tokenABalance).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '...'
        : tokenBBalance
        ? parseFloat(tokenBBalance || '...').toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

    const walletAndSurplusBalanceNonLocaleString = props.sellToken
        ? tokenADexBalance
            ? isSellTokenEth
                ? (
                      parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                  ).toFixed(18)
                : (
                      parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                  ).toString()
            : ''
        : tokenBDexBalance
        ? (parseFloat(tokenBDexBalance) + parseFloat(tokenBBalance)).toString()
        : '';

    const walletAndSurplusBalanceLocaleString = props.sellToken
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

    const isTokenADexBalanceNonZero =
        !!tokenADexBalance && parseFloat(tokenADexBalance) > 0;

    const balanceLocaleString =
        (isSellTokenSelector && !isWithdrawFromDexChecked) ||
        (!isSellTokenSelector && !isSaveAsDexSurplusChecked)
            ? walletBalanceLocaleString
            : walletAndSurplusBalanceLocaleString;

    const balanceNonLocaleString =
        (isSellTokenSelector && !isWithdrawFromDexChecked) ||
        (!isSellTokenSelector && !isSaveAsDexSurplusChecked)
            ? walletBalanceNonLocaleString
            : walletAndSurplusBalanceNonLocaleString;

    const isCombinedBalanceNonZero = isSellTokenEth
        ? !!balanceNonLocaleString &&
          parseFloat(balanceNonLocaleString) - displayAmountToReduceEth > 0
        : !!balanceNonLocaleString && parseFloat(balanceNonLocaleString) > 0;

    const refreshTokenData = async () => {
        if (isTokenAPrimaryLocal) {
            setIsBuyLoading(true);
            handleTokenAChangeEvent && (await handleTokenAChangeEvent());
            setIsBuyLoading(false);
        } else {
            setIsSellLoading(true);
            handleTokenBChangeEvent && (await handleTokenBChangeEvent());

            setIsSellLoading(false);
        }
    };

    // Wallet balance function and styles-----------------------------

    function handleWalletBalanceClick() {
        if (props.sellToken) {
            setIsWithdrawFromDexChecked(false);
            if (isTokenADexBalanceNonZero) {
                setUserOverrodeSurplusWithdrawalDefault(true);
            }
        } else {
            dexBalSwap.outputToDexBal.disable();
            setIsSaveAsDexSurplusChecked(false);
        }
    }

    const adjustedBalanceNonLocaleString =
        isSellTokenEth && !!balanceNonLocaleString
            ? (
                  parseFloat(balanceNonLocaleString) - displayAmountToReduceEth
              ).toFixed(18)
            : balanceNonLocaleString;

    function handleMaxButtonClick() {
        if (handleChangeClick && isUserConnected) {
            handleChangeClick(adjustedBalanceNonLocaleString);
            setUserClickedCombinedMax(true);
        }
    }

    const handleAutoMax = () => {
        if (
            handleChangeClick &&
            adjustedBalanceNonLocaleString &&
            userClickedCombinedMax
        ) {
            handleChangeClick(adjustedBalanceNonLocaleString);
            setDisableReverseTokens(true);
        }
    };

    useEffect(() => {
        handleAutoMax();
    }, [
        isWithdrawFromDexChecked,
        userClickedCombinedMax,
        balanceNonLocaleString,
    ]);

    const maxButtonTitle = (
        <p
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
            }}
            onClick={() => {
                isWithdrawFromDexChecked &&
                !!tokenADexBalance &&
                parseFloat(tokenADexBalance) > 0
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
            {isWithdrawFromDexChecked &&
            !!tokenADexBalance &&
            parseFloat(tokenADexBalance) > 0
                ? 'Use Maximum Wallet + Exchange Balance'
                : 'Use Maximum Wallet Balance'}
            <AiOutlineQuestionCircle size={14} />
        </p>
    );

    const maxButton = (
        <DefaultTooltip
            interactive
            title={maxButtonTitle}
            placement={'bottom'}
            arrow
            enterDelay={700}
            leaveDelay={200}
        >
            <button
                className={`${styles.max_button} ${styles.max_button_enable}`}
                onClick={handleMaxButtonClick}
            >
                Max
            </button>
        </DefaultTooltip>
    );
    const sellTokenLogoClassname =
        (isSellTokenSelector && !isWithdrawFromDexChecked) ||
        (!isSellTokenSelector && !isSaveAsDexSurplusChecked)
            ? styles.grey_logo
            : styles.enabled_logo;

    function handleSurplusClick() {
        if (props.sellToken) {
            setIsWithdrawFromDexChecked(true);
            if (isTokenADexBalanceNonZero) {
                setUserOverrodeSurplusWithdrawalDefault(false);
            }
        } else {
            dexBalSwap.outputToDexBal.enable();
            setIsSaveAsDexSurplusChecked(true);
        }
    }

    const walletBalanceTitle = (
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
            {!isSellTokenSelector
                ? 'Wallet Balance'
                : isCombinedBalanceNonZero
                ? 'Use Maximum Wallet Balance'
                : 'Wallet Balance'}
            <AiOutlineQuestionCircle size={14} />
        </p>
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
            {isSellTokenSelector
                ? isCombinedBalanceNonZero
                    ? 'Use Maximum Wallet + Exchange Balance'
                    : 'Wallet + Exchange Balance'
                : 'Wallet + Exchange Balance'}
            <AiOutlineQuestionCircle size={14} />
        </p>
    );

    const walletContent = (
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
                        onClick={() => handleWalletBalanceClick()}
                    >
                        <img
                            src={
                                (isSellTokenSelector &&
                                    !isWithdrawFromDexChecked) ||
                                (!isSellTokenSelector &&
                                    !isSaveAsDexSurplusChecked)
                                    ? walletEnabledIcon
                                    : walletIcon
                            }
                            width='20'
                        />
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
                        className={`${styles.ambient_logo} ${sellTokenLogoClassname}`}
                        onClick={() => handleSurplusClick()}
                    >
                        <img src={ambientLogo} width='20' alt='surplus' />
                    </div>
                </IconWithTooltip>
                <DefaultTooltip
                    interactive
                    title={
                        (isSellTokenSelector && isWithdrawFromDexChecked) ||
                        (!isSellTokenSelector && isSaveAsDexSurplusChecked)
                            ? exchangeBalanceTitle
                            : walletBalanceTitle
                    }
                    placement={'bottom'}
                    arrow
                    enterDelay={700}
                    leaveDelay={200}
                >
                    <div
                        className={styles.balance_column}
                        style={
                            isSellTokenSelector && isCombinedBalanceNonZero
                                ? { cursor: 'pointer' }
                                : { cursor: 'default' }
                        }
                        onClick={() => {
                            if (
                                handleChangeClick &&
                                isUserConnected &&
                                isCombinedBalanceNonZero
                            ) {
                                handleChangeClick(balanceNonLocaleString);
                                setUserClickedCombinedMax(true);
                            }
                        }}
                    >
                        <div>{isUserConnected ? balanceLocaleString : ''}</div>
                    </div>
                </DefaultTooltip>
                {isCombinedBalanceNonZero && isSellTokenSelector
                    ? maxButton
                    : null}
            </div>
            {!isSellTokenSelector && (
                <button
                    onClick={refreshTokenData}
                    className={styles.refresh_button}
                    aria-label='Refresh data'
                >
                    <FiRefreshCw size={18} />
                </button>
            )}
        </section>
    );
    // End of  Wallet balance function and styles-----------------------------

    const [isTokenSelectOpen, openTokenSelect, closeTokenSelect] = useModal();

    const swapboxBottomOrNull = !isUserConnected ? (
        <div className={styles.swapbox_bottom} />
    ) : (
        <div className={styles.swapbox_bottom}>{walletContent}</div>
    );

    const [showSoloSelectTokenButtons, setShowSoloSelectTokenButtons] =
        useState(true);

    const tokenSymbol =
        thisToken?.symbol?.length > 4 ? (
            <DefaultTooltip
                title={thisToken.symbol}
                placement={'top'}
                arrow
                enterDelay={700}
                leaveDelay={200}
            >
                <div className={styles.token_list_text}>{thisToken.symbol}</div>
            </DefaultTooltip>
        ) : (
            <div className={styles.token_list_text}>{thisToken.symbol}</div>
        );

    return (
        <>
            <div className={styles.swapbox}>
                <div className={styles.swapbox_top}>
                    <div className={styles.swap_input} id='swap_sell_qty'>
                        <CurrencyQuantity
                            value={
                                tokenAorB === 'A' ? sellQtyString : buyQtyString
                            }
                            thisToken={thisToken}
                            setSellQtyString={setSellQtyString}
                            setBuyQtyString={setBuyQtyString}
                            fieldId={fieldId}
                            handleChangeEvent={handleChangeEvent}
                            setDisableReverseTokens={setDisableReverseTokens}
                            setIsSellLoading={setIsSellLoading}
                            setIsBuyLoading={setIsBuyLoading}
                            isLoading={isLoading}
                        />
                    </div>
                    <button
                        className={`${styles.token_select} ${
                            showSwapPulseAnimation && styles.pulse_animation
                        }`}
                        onClick={openTokenSelect}
                        tabIndex={0}
                        aria-label='Open swap sell token modal.'
                        id='swap_token_selector'
                    >
                        <TokenIcon
                            src={uriToHttp(thisToken.logoURI)}
                            alt={thisToken.symbol}
                            size='2xl'
                        />
                        {tokenSymbol}
                        <RiArrowDownSLine size={27} />
                    </button>
                </div>
                {swapboxBottomOrNull}
            </div>
            <SoloTokenSelectModal
                isOpen={isTokenSelectOpen}
                onClose={closeTokenSelect}
                showSoloSelectTokenButtons={showSoloSelectTokenButtons}
                setShowSoloSelectTokenButtons={setShowSoloSelectTokenButtons}
                isSingleToken={false}
                tokenAorB={tokenAorB}
                reverseTokens={reverseTokens}
            />
        </>
    );
}

export default memo(CurrencySelector);
