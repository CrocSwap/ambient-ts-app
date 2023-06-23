import {
    ChangeEvent,
    Dispatch,
    memo,
    SetStateAction,
    useContext,
    useState,
} from 'react';
import styles from './RangeCurrencySelector.module.css';
import RangeCurrencyQuantity from '../RangeCurrencyQuantity/RangeCurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
import { useModal } from '../../../../components/Global/Modal/useModal';
import Modal from '../../../../components/Global/Modal/Modal';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import ambientLogo from '../../../../assets/images/icons/ambient_icon.png';
import walletIcon from '../../../../assets/images/icons/wallet.svg';
import walletEnabledIcon from '../../../../assets/images/icons/wallet-enabled.svg';
import { SoloTokenSelect } from '../../../../components/Global/TokenSelectContainer/SoloTokenSelect';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import ExchangeBalanceExplanation from '../../../Global/Informational/ExchangeBalanceExplanation';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { IS_LOCAL_ENV } from '../../../../constants';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { TokenContext } from '../../../../contexts/TokenContext';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import uriToHttp from '../../../../utils/functions/uriToHttp';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';

interface propsIF {
    fieldId: string;
    isTokenAEth: boolean;
    isTokenBEth: boolean;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
    isWithdrawTokenAFromDexChecked: boolean;
    setIsWithdrawTokenAFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isWithdrawTokenBFromDexChecked: boolean;
    setIsWithdrawTokenBFromDexChecked: Dispatch<SetStateAction<boolean>>;
    sellToken?: boolean;
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
        sellToken,
        updateOtherQuantity,
        reverseTokens,
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenAInputQty,
        tokenBInputQty,
        tokenBDexBalance,
        isTokenADisabled,
        isTokenBDisabled,
        isAdvancedMode,
        handleChangeClick,
        tokenAorB,
        setUserOverrodeSurplusWithdrawalDefault,
    } = props;

    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { setInput } = useContext(TokenContext);
    const { showRangePulseAnimation } = useContext(TradeTableContext);

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

    const isTokenASelector = fieldId === 'A';

    const thisToken = isTokenASelector ? tokenA : tokenB;

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

    const walletAndSurplusBalanceLocaleString = getFormattedNumber({
        value: isTokenASelector
            ? tokenADexBalance
                ? parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                : undefined
            : tokenBDexBalance
            ? parseFloat(tokenBDexBalance) + parseFloat(tokenBBalance)
            : undefined,
        isUSD: true,
    });

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

    const walletBalanceLocaleString = getFormattedNumber({
        value: isTokenASelector
            ? parseFloat(tokenABalance)
            : parseFloat(tokenBBalance),
        isUSD: true,
    });

    const isFieldDisabled =
        (isTokenASelector && isTokenADisabled) ||
        (!isTokenASelector && isTokenBDisabled);

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
        <div className={styles.swapbox}>
            <span className={styles.direction}>
                {sellToken ? 'Amounts' : ''}
            </span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input} id='range_sell_qty'>
                    <RangeCurrencyQuantity
                        value={
                            tokenAorB === 'A' ? tokenAInputQty : tokenBInputQty
                        }
                        thisToken={thisToken}
                        fieldId={fieldId}
                        updateOtherQuantity={updateOtherQuantity}
                        disable={isFieldDisabled}
                        isAdvancedMode={isAdvancedMode}
                    />
                </div>
                <button
                    className={`${styles.token_select} ${
                        showRangePulseAnimation && styles.pulse_animation
                    }`}
                    onClick={() => openTokenModal()}
                    id='range_token_selector'
                    tabIndex={0}
                    aria-label={`Open range ${fieldId} token modal.`}
                >
                    <TokenIcon
                        src={uriToHttp(thisToken.logoURI)}
                        alt={thisToken.name + 'token logo'}
                        size='2xl'
                    />
                    <span className={styles.token_list_text}>
                        {thisToken.symbol}
                    </span>
                    <RiArrowDownSLine size={27} />
                </button>
            </div>
            {swapboxBottomOrNull}
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

export default memo(RangeCurrencySelector);
