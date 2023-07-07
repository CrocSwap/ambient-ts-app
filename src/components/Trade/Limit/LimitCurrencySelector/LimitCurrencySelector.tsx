// START: Import React and Dongles
import {
    ChangeEvent,
    Dispatch,
    memo,
    SetStateAction,
    useContext,
    useState,
} from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import React Functional Components
import LimitCurrencyQuantity from '../LimitCurrencyQuantity/LimitCurrencyQuantity';

// START: Import Local Files
import styles from './LimitCurrencySelector.module.css';
import Modal from '../../../../components/Global/Modal/Modal';
import { useModal } from '../../../../components/Global/Modal/useModal';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import ambientLogo from '../../../../assets/images/icons/ambient_icon.png';
import walletIcon from '../../../../assets/images/icons/wallet.svg';
import walletEnabledIcon from '../../../../assets/images/icons/wallet-enabled.svg';
import { SoloTokenSelect } from '../../../Global/TokenSelectContainer/SoloTokenSelect';
import ExchangeBalanceExplanation from '../../../Global/Informational/ExchangeBalanceExplanation';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { TokenContext } from '../../../../contexts/TokenContext';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import uriToHttp from '../../../../utils/functions/uriToHttp';

// interface for component props
interface propsIF {
    tokenAInputQty: string;
    tokenBInputQty: string;
    fieldId: string;
    sellToken?: boolean;
    reverseTokens: () => void;
    tokenABalance: string;
    tokenADexBalance: string;
    isSellTokenEth?: boolean;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    handleChangeClick?: (value: string) => void;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    tokenAorB: string;
    setUserOverrodeSurplusWithdrawalDefault: Dispatch<SetStateAction<boolean>>;
    parseInput: (val: string) => void;
}

// central react functional component
function LimitCurrencySelector(props: propsIF) {
    const {
        tokenAInputQty,
        tokenBInputQty,
        fieldId,
        handleChangeEvent,
        reverseTokens,
        tokenABalance,
        tokenADexBalance,
        isSellTokenEth,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        setIsSaveAsDexSurplusChecked,
        handleChangeClick,
        tokenAorB,
        setUserOverrodeSurplusWithdrawalDefault,
        parseInput,
    } = props;

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );
    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);
    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { setInput } = useContext(TokenContext);
    const { showOrderPulseAnimation } = useContext(TradeTableContext);
    const { dexBalLimit } = useContext(UserPreferenceContext);

    const thisToken = fieldId === 'sell' ? tokenA : tokenB;

    const isSellTokenSelector = fieldId === 'sell';

    // IMPORTANT!  The Limit Order module is the one only transaction configurator
    // ... in the app which has an input field with no token selector.  For that
    // ... reason, `LimitCurrencySelector.tsx` file needs to be coded separately
    // ... from its counterparts in the Swap/Market/Pool modules, even if we use
    // ... a common element for those modules in the future.

    const modalCloseCustom = (): void => setInput('');

    const [isTokenModalOpen, openTokenModal, closeTokenModal] =
        useModal(modalCloseCustom);
    const [showSoloSelectTokenButtons, setShowSoloSelectTokenButtons] =
        useState(true);

    const handleInputClear = (): void => {
        setInput('');
        const soloTokenSelectInput = document.getElementById(
            'solo-token-select-input',
        ) as HTMLInputElement;
        soloTokenSelectInput.value = '';
    };

    const tokenSelect = (
        <button
            className={`${styles.token_select} ${
                showOrderPulseAnimation && styles.pulse_animation
            }`}
            onClick={openTokenModal}
            tabIndex={0}
            aria-label={`Open swap ${fieldId} token modal.`}
            id='limit_token_selector'
        >
            <TokenIcon
                src={uriToHttp(thisToken.logoURI)}
                alt={thisToken.name + 'token logo'}
                size='2xl'
            />
            <span className={styles.token_list_text}>{thisToken.symbol}</span>
            <RiArrowDownSLine size={27} />
        </button>
    );

    const walletBalanceNonLocaleString =
        tokenABalance && gasPriceInGwei
            ? isSellTokenEth
                ? (
                      parseFloat(tokenABalance) -
                      gasPriceInGwei * 400000 * 1e-9
                  ).toFixed(18)
                : tokenABalance
            : '';

    const walletBalanceLocaleString = tokenABalance
        ? parseFloat(tokenABalance).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

    const walletAndSurplusBalanceNonLocaleString =
        tokenADexBalance && gasPriceInGwei
            ? isSellTokenEth
                ? (
                      parseFloat(tokenADexBalance) +
                      parseFloat(tokenABalance) -
                      gasPriceInGwei * 400000 * 1e-9
                  ).toFixed(18)
                : (
                      parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                  ).toString()
            : '';

    const walletAndSurplusBalanceLocaleString = tokenADexBalance
        ? (
              parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
          ).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

    const balanceLocaleString =
        isSellTokenSelector && !isWithdrawFromDexChecked
            ? walletBalanceLocaleString
            : walletAndSurplusBalanceLocaleString;

    const balanceNonLocaleString =
        isSellTokenSelector && !isWithdrawFromDexChecked
            ? walletBalanceNonLocaleString
            : walletAndSurplusBalanceNonLocaleString;

    function handleMaxButtonClick() {
        if (handleChangeClick && isUserConnected) {
            handleChangeClick(balanceNonLocaleString);
        }
    }

    const maxButton =
        isSellTokenSelector && balanceLocaleString !== '0.00' ? (
            <button
                className={`${styles.max_button} ${styles.max_button_enable}`}
                onClick={() => handleMaxButtonClick()}
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
        <section className={styles.main_wallet_container}>
            <div className={styles.balance_with_pointer}>
                <IconWithTooltip
                    title={`${
                        tokenAorB === 'A'
                            ? 'Use Wallet Balance Only'
                            : 'Withdraw to Wallet'
                    }`}
                    placement='bottom'
                >
                    <div
                        className={`${styles.balance_with_pointer}`}
                        onClick={() => {
                            if (props.sellToken) {
                                setIsWithdrawFromDexChecked(false);
                                if (
                                    !!tokenADexBalance &&
                                    parseFloat(tokenADexBalance) > 0
                                ) {
                                    setUserOverrodeSurplusWithdrawalDefault(
                                        true,
                                    );
                                }
                            } else {
                                setIsSaveAsDexSurplusChecked(false);
                                dexBalLimit.outputToDexBal.disable();
                            }
                        }}
                    >
                        <div className={styles.wallet_logo}>
                            <img
                                src={
                                    isSellTokenSelector &&
                                    !isWithdrawFromDexChecked
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
                            ? 'Use Wallet and Exchange Balance'
                            : 'Add to Exchange Balance'
                    }`}
                    placement='bottom'
                >
                    <div
                        className={`${styles.balance_with_pointer} ${
                            isSellTokenSelector && !isWithdrawFromDexChecked
                                ? styles.grey_logo
                                : null
                        }`}
                        onClick={() => {
                            if (props.sellToken) {
                                setIsWithdrawFromDexChecked(true);
                                if (
                                    !!tokenADexBalance &&
                                    parseFloat(tokenADexBalance) > 0
                                ) {
                                    setUserOverrodeSurplusWithdrawalDefault(
                                        false,
                                    );
                                }
                            } else {
                                dexBalLimit.outputToDexBal.enable();
                                setIsSaveAsDexSurplusChecked(true);
                            }
                        }}
                    >
                        <div
                            className={`${styles.wallet_logo} ${
                                isWithdrawFromDexChecked
                                    ? styles.enabled_logo
                                    : null
                            }`}
                        >
                            <img src={ambientLogo} width='20' alt='surplus' />
                        </div>
                    </div>
                </IconWithTooltip>
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
                        // onClick={() => handleMaxButtonClick()}
                    >
                        {isUserConnected ? balanceLocaleString : ''}
                    </div>
                </DefaultTooltip>
                {maxButton}
            </div>
        </section>
    );

    const balanceDisplayOrNull = isSellTokenSelector ? (
        !isUserConnected ? (
            <div className={styles.swapbox_bottom} />
        ) : (
            <div className={styles.swapbox_bottom}>{walletContent}</div>
        )
    ) : null;

    return (
        <div className={styles.swapbox}>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input} id='limit_sell_qty'>
                    <LimitCurrencyQuantity
                        value={
                            tokenAorB === 'A' ? tokenAInputQty : tokenBInputQty
                        }
                        thisToken={thisToken}
                        fieldId={fieldId}
                        handleChangeEvent={handleChangeEvent}
                        parseInput={parseInput}
                    />
                </div>
                {fieldId === 'buy' || fieldId === 'sell' ? tokenSelect : null}
            </div>
            {balanceDisplayOrNull}
            {isTokenModalOpen && (
                <Modal
                    onClose={closeTokenModal}
                    title='Select Token'
                    centeredTitle
                    handleBack={handleInputClear}
                    showBackButton={false}
                    footer={null}
                >
                    <SoloTokenSelect
                        modalCloseCustom={modalCloseCustom}
                        closeModal={closeTokenModal}
                        showSoloSelectTokenButtons={showSoloSelectTokenButtons}
                        setShowSoloSelectTokenButtons={
                            setShowSoloSelectTokenButtons
                        }
                        isSingleToken={false}
                        tokenAorB={tokenAorB}
                        reverseTokens={reverseTokens}
                    />
                </Modal>
            )}
        </div>
    );
}

export default memo(LimitCurrencySelector);
