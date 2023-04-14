import { ethers } from 'ethers';
import styles from './CurrencySelector.module.css';
import CurrencyQuantity from '../CurrencyQuantity/CurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
// import Toggle from '../../Global/Toggle/Toggle';
import {
    useState,
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useEffect,
} from 'react';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { useModal } from '../../../components/Global/Modal/useModal';
import Modal from '../../../components/Global/Modal/Modal';
import ambientLogo from '../../../assets/images/icons/ambient_icon.png';
import walletIcon from '../../../assets/images/icons/wallet.svg';
import walletEnabledIcon from '../../../assets/images/icons/wallet-enabled.svg';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';
import { SoloTokenSelect } from '../../Global/TokenSelectContainer/SoloTokenSelect';
import { getRecentTokensParamsIF } from '../../../App/hooks/useRecentTokens';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import { allDexBalanceMethodsIF } from '../../../App/hooks/useExchangePrefs';
import { ackTokensMethodsIF } from '../../../App/hooks/useAckTokens';
import ExchangeBalanceExplanation from '../../Global/Informational/ExchangeBalanceExplanation';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

interface propsIF {
    provider: ethers.providers.Provider | undefined;
    isUserLoggedIn: boolean | undefined;
    tokenPair: TokenPairIF;
    chainId: string;
    fieldId: string;
    tokenAorB: string | null;
    direction: string;
    sellToken?: boolean;
    sellQtyString: string;
    setSellQtyString: Dispatch<SetStateAction<string>>;
    buyQtyString: string;
    setBuyQtyString: Dispatch<SetStateAction<string>>;
    tokenBQtyLocal?: string;
    tokenABalance: string;
    tokenBBalance: string;
    tokenADexBalance: string;
    tokenBDexBalance: string;
    isSellTokenEth?: boolean;
    tokenAQtyCoveredByWalletBalance?: number;
    tokenAQtyCoveredBySurplusBalance?: number;
    tokenBQtyCoveredByWalletBalance?: number;
    tokenBQtyCoveredBySurplusBalance?: number;
    tokenASurplusMinusTokenARemainderNum?: number;
    tokenAWalletMinusTokenAQtyNum: number;
    tokenBWalletPlusTokenBQtyNum: number;
    tokenASurplusMinusTokenAQtyNum: number;
    tokenBSurplusPlusTokenBQtyNum: number;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    handleChangeClick?: (value: string) => void;
    reverseTokens: () => void;
    gasPriceInGwei: number | undefined;
    isSwapCopied?: boolean;
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
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: Dispatch<SetStateAction<string>>;
    searchType: string;
    openGlobalPopup: (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => void;
    setDisableReverseTokens: Dispatch<SetStateAction<boolean>>;
    dexBalancePrefs: allDexBalanceMethodsIF;
    ackTokens: ackTokensMethodsIF;
}

export default function CurrencySelector(props: propsIF) {
    const {
        setDisableReverseTokens,
        provider,
        sellQtyString,
        setSellQtyString,
        buyQtyString,
        setBuyQtyString,
        isUserLoggedIn,
        tokenPair,
        chainId,
        fieldId,
        tokenAorB,
        handleChangeEvent,
        handleChangeClick,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        isSwapCopied,
        isSellTokenEth,
        reverseTokens,
        gasPriceInGwei,
        verifyToken,
        getTokensByName,
        getTokenByAddress,
        importedTokensPlus,
        addRecentToken,
        getRecentTokens,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        openGlobalPopup,
        dexBalancePrefs,
        ackTokens,
    } = props;

    const isSellTokenSelector = fieldId === 'sell';
    const thisToken = isSellTokenSelector
        ? tokenPair.dataTokenA
        : tokenPair.dataTokenB;

    const handleDexBalanceChange = () => {
        if (parseFloat(tokenADexBalance) < 0) {
            setIsWithdrawFromDexChecked(true);
        } else if (dexBalancePrefs.swap.drawFromDexBal.isEnabled) {
            setIsWithdrawFromDexChecked(
                dexBalancePrefs.swap.drawFromDexBal.isEnabled,
            );
        }
    };

    useEffect(() => {
        handleDexBalanceChange();
    }, [tokenADexBalance]);

    const walletBalanceNonLocaleString = props.sellToken
        ? tokenABalance && gasPriceInGwei
            ? isSellTokenEth
                ? (
                      parseFloat(tokenABalance) -
                      gasPriceInGwei * 400000 * 1e-9
                  ).toFixed(18)
                : tokenABalance
            : ''
        : tokenBBalance
        ? tokenBBalance
        : '';

    const walletBalanceLocaleString = props.sellToken
        ? tokenABalance
            ? parseFloat(tokenABalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '...'
        : tokenBBalance
        ? parseFloat(tokenBBalance || '...').toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

    const walletAndSurplusBalanceNonLocaleString = props.sellToken
        ? tokenADexBalance && gasPriceInGwei
            ? isSellTokenEth
                ? (
                      parseFloat(tokenADexBalance) +
                      parseFloat(tokenABalance) -
                      gasPriceInGwei * 400000 * 1e-9
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
              ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '...'
        : tokenBDexBalance
        ? (
              parseFloat(tokenBDexBalance) + parseFloat(tokenBBalance)
          ).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

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

    // Wallet balance function and styles-----------------------------

    function handleWalletBalanceClick() {
        if (props.sellToken) {
            dexBalancePrefs.swap.drawFromDexBal.disable();
            setIsWithdrawFromDexChecked(false);
        } else {
            dexBalancePrefs.swap.outputToDexBal.disable();
            setIsSaveAsDexSurplusChecked(false);
        }
    }

    function handleMaxButtonClick() {
        if (handleChangeClick && isUserLoggedIn && !isSellTokenEth) {
            handleChangeClick(balanceNonLocaleString);
        }
    }

    const maxButton =
        balanceLocaleString !== '0.00' &&
        isSellTokenSelector &&
        !isSellTokenEth ? (
            <button
                className={`${styles.max_button} ${styles.max_button_enable}`}
                onClick={() => handleMaxButtonClick()}
            >
                Max
            </button>
        ) : (
            <p className={styles.max_button} />
        );

    const sellTokenLogoClassname =
        (isSellTokenSelector && !isWithdrawFromDexChecked) ||
        (!isSellTokenSelector && !isSaveAsDexSurplusChecked)
            ? styles.grey_logo
            : styles.enabled_logo;

    function handleSurplusClick() {
        if (props.sellToken) {
            dexBalancePrefs.swap.drawFromDexBal.enable();
            setIsWithdrawFromDexChecked(true);
        } else {
            dexBalancePrefs.swap.outputToDexBal.enable();
            setIsSaveAsDexSurplusChecked(true);
        }
    }

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
            Wallet & Exchange Balance <AiOutlineQuestionCircle size={14} />
        </p>
    );

    const walletContent = (
        <section className={styles.wallet_container}>
            <div className={`${styles.balance_with_pointer}`}>
                <IconWithTooltip
                    title={`${
                        tokenAorB === 'A'
                            ? 'Use wallet balance only'
                            : 'Withdraw to wallet'
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
                            ? 'Use exchange and wallet balance'
                            : 'Add to exchange balance'
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
                    title={exchangeBalanceTitle}
                    placement={'bottom'}
                    arrow
                    enterDelay={100}
                    leaveDelay={200}
                >
                    <div
                        className={styles.balance_column}
                        onClick={() => handleMaxButtonClick()}
                    >
                        <div>{isUserLoggedIn ? balanceLocaleString : ''}</div>
                    </div>
                </DefaultTooltip>
                {maxButton}
            </div>
        </section>
    );
    // End of  Wallet balance function and styles-----------------------------

    const swapboxBottomOrNull = !isUserLoggedIn ? (
        <div className={styles.swapbox_bottom} />
    ) : (
        <div className={styles.swapbox_bottom}>{walletContent}</div>
    );

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

    const tokenSymbol =
        thisToken?.symbol?.length > 4 ? (
            <DefaultTooltip
                title={thisToken.symbol}
                placement={'top'}
                arrow
                enterDelay={100}
                leaveDelay={200}
            >
                <div className={styles.token_list_text}>{thisToken.symbol}</div>
            </DefaultTooltip>
        ) : (
            <div className={styles.token_list_text}>{thisToken.symbol}</div>
        );

    return (
        <div className={styles.swapbox}>
            <div className={styles.direction} />
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input} id='swap_sell_qty'>
                    <CurrencyQuantity
                        value={tokenAorB === 'A' ? sellQtyString : buyQtyString}
                        thisToken={thisToken}
                        setSellQtyString={setSellQtyString}
                        setBuyQtyString={setBuyQtyString}
                        fieldId={fieldId}
                        handleChangeEvent={handleChangeEvent}
                        setDisableReverseTokens={setDisableReverseTokens}
                    />
                </div>
                <button
                    className={`${styles.token_select} ${
                        isSwapCopied && styles.pulse_animation
                    }`}
                    onClick={openTokenModal}
                    tabIndex={0}
                    aria-label='Open swap sell token modal.'
                    id='swap_token_selector'
                >
                    {thisToken.logoURI ? (
                        <img
                            className={styles.token_list_img}
                            src={thisToken.logoURI}
                            alt={thisToken.name}
                            width='30px'
                        />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={thisToken.symbol.charAt(0)}
                            width='30px'
                        />
                    )}
                    {tokenSymbol}
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
