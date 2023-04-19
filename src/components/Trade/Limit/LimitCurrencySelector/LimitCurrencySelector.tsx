// START: Import React and Dongles
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { ethers } from 'ethers';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import React Functional Components
import LimitCurrencyQuantity from '../LimitCurrencyQuantity/LimitCurrencyQuantity';

// START: Import Local Files
import styles from './LimitCurrencySelector.module.css';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import Modal from '../../../../components/Global/Modal/Modal';
import { useModal } from '../../../../components/Global/Modal/useModal';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import ambientLogo from '../../../../assets/images/icons/ambient_icon.png';
import walletIcon from '../../../../assets/images/icons/wallet.svg';
import walletEnabledIcon from '../../../../assets/images/icons/wallet-enabled.svg';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import { SoloTokenSelect } from '../../../Global/TokenSelectContainer/SoloTokenSelect';
import { getRecentTokensParamsIF } from '../../../../App/hooks/useRecentTokens';
import { allDexBalanceMethodsIF } from '../../../../App/hooks/useExchangePrefs';
import ExchangeBalanceExplanation from '../../../Global/Informational/ExchangeBalanceExplanation';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { ackTokensMethodsIF } from '../../../../App/hooks/useAckTokens';

// interface for component props
interface propsIF {
    provider?: ethers.providers.Provider;
    isUserLoggedIn: boolean | undefined;
    tokenPair: TokenPairIF;
    chainId: string;
    tokenAInputQty: string;
    tokenBInputQty: string;
    setTokenAInputQty: Dispatch<SetStateAction<string>>;
    setTokenBInputQty: Dispatch<SetStateAction<string>>;
    fieldId: string;
    direction: string;
    sellToken?: boolean;
    reverseTokens: () => void;
    tokenABalance: string;
    tokenBBalance: string;
    tokenADexBalance: string;
    tokenBDexBalance: string;
    isSellTokenEth?: boolean;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    handleChangeClick?: (value: string) => void;
    isWithdrawFromDexChecked: boolean;
    tokenAWalletMinusTokenAQtyNum: number;
    tokenASurplusMinusTokenAQtyNum: number;
    tokenASurplusMinusTokenARemainderNum: number;
    tokenAQtyCoveredBySurplusBalance: number;
    tokenAQtyCoveredByWalletBalance: number;
    setIsWithdrawFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    gasPriceInGwei: number | undefined;

    isOrderCopied: boolean;
    verifyToken: (addr: string, chn: string) => boolean;
    getTokensByName: (
        searchName: string,
        chn: string,
        exact: boolean,
    ) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    importedTokensPlus: TokenIF[];
    getRecentTokens: (
        options?: getRecentTokensParamsIF | undefined,
    ) => TokenIF[];
    addRecentToken: (tkn: TokenIF) => void;
    tokenAorB: string;
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: Dispatch<SetStateAction<string>>;
    searchType: string;
    openGlobalPopup: (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => void;
    dexBalancePrefs: allDexBalanceMethodsIF;
    ackTokens: ackTokensMethodsIF;
    setUserOverrodeSurplusWithdrawalDefault: Dispatch<SetStateAction<boolean>>;
}

// central react functional component
export default function LimitCurrencySelector(props: propsIF) {
    const {
        provider,
        isUserLoggedIn,
        tokenPair,
        chainId,
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
        gasPriceInGwei,
        handleChangeClick,
        isOrderCopied,
        verifyToken,
        getTokensByName,
        getTokenByAddress,
        importedTokensPlus,
        getRecentTokens,
        addRecentToken,
        tokenAorB,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        openGlobalPopup,
        dexBalancePrefs,
        ackTokens,
        setUserOverrodeSurplusWithdrawalDefault,
    } = props;

    const thisToken =
        fieldId === 'sell' ? tokenPair.dataTokenA : tokenPair.dataTokenB;

    const isSellTokenSelector = fieldId === 'sell';

    // IMPORTANT!  The Limit Order module is the one only transaction configurator
    // ... in the app which has an input field with no token selector.  For that
    // ... reason, `LimitCurrencySelector.tsx` file needs to be coded separately
    // ... from its counterparts in the Swap/Market/Range modules, even if we use
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
                isOrderCopied && styles.pulse_animation
            }`}
            onClick={openTokenModal}
            tabIndex={0}
            aria-label={`Open swap ${fieldId} token modal.`}
            id='limit_token_selector'
        >
            {thisToken.logoURI ? (
                <img
                    className={styles.token_list_img}
                    src={thisToken.logoURI}
                    alt={thisToken.name + 'token logo'}
                    width='30px'
                />
            ) : (
                <NoTokenIcon
                    tokenInitial={thisToken.symbol.charAt(0)}
                    width='30px'
                />
            )}
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
        ? parseFloat(tokenABalance).toLocaleString(undefined, {
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
          ).toLocaleString(undefined, {
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
        if (handleChangeClick && isUserLoggedIn && !isSellTokenEth) {
            handleChangeClick(balanceNonLocaleString);
        }
    }

    const maxButton =
        isSellTokenSelector &&
        !isSellTokenEth &&
        balanceLocaleString !== '0.00' ? (
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
                                dexBalancePrefs.limit.outputToDexBal.disable();
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
                                dexBalancePrefs.limit.outputToDexBal.enable();
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
                        {isUserLoggedIn ? balanceLocaleString : ''}
                    </div>
                </DefaultTooltip>
                {maxButton}
            </div>
        </section>
    );

    const balanceDisplayOrNull = isSellTokenSelector ? (
        !isUserLoggedIn ? (
            <div className={styles.swapbox_bottom} />
        ) : (
            <div className={styles.swapbox_bottom}>{walletContent}</div>
        )
    ) : null;

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}> </span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input} id='limit_sell_qty'>
                    <LimitCurrencyQuantity
                        value={
                            tokenAorB === 'A' ? tokenAInputQty : tokenBInputQty
                        }
                        thisToken={thisToken}
                        fieldId={fieldId}
                        handleChangeEvent={handleChangeEvent}
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
                        provider={provider}
                        closeModal={closeTokenModal}
                        chainId={chainId}
                        importedTokensPlus={importedTokensPlus}
                        getTokensByName={getTokensByName}
                        getTokenByAddress={getTokenByAddress}
                        verifyToken={verifyToken}
                        showSoloSelectTokenButtons={showSoloSelectTokenButtons}
                        setShowSoloSelectTokenButtons={
                            setShowSoloSelectTokenButtons
                        }
                        outputTokens={outputTokens}
                        validatedInput={validatedInput}
                        setInput={setInput}
                        searchType={searchType}
                        addRecentToken={addRecentToken}
                        getRecentTokens={getRecentTokens}
                        isSingleToken={false}
                        tokenAorB={tokenAorB}
                        reverseTokens={reverseTokens}
                        tokenPair={tokenPair}
                        ackTokens={ackTokens}
                    />
                </Modal>
            )}
        </div>
    );
}
