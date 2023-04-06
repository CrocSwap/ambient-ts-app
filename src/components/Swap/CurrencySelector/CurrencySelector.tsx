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
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import walletIcon from '../../../assets/images/icons/wallet.svg';
import { TbWallet } from 'react-icons/tb';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';
import { SoloTokenSelect } from '../../Global/TokenSelectContainer/SoloTokenSelect';
import { getRecentTokensParamsIF } from '../../../App/hooks/useRecentTokens';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import ExchangeBalanceExplanation from '../../Global/Informational/ExchangeBalanceExplanation';
import { allDexBalanceMethodsIF } from '../../../App/hooks/useExchangePrefs';

interface propsIF {
    provider: ethers.providers.Provider | undefined;
    isUserLoggedIn: boolean | undefined;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
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
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
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
    acknowledgeToken: (tkn: TokenIF) => void;
    openGlobalPopup: (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => void;
    setDisableReverseTokens: Dispatch<SetStateAction<boolean>>;
    dexBalancePrefs: allDexBalanceMethodsIF;
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
        // tokensBank,
        setImportedTokens,
        chainId,
        // direction,
        fieldId,
        tokenAorB,
        handleChangeEvent,
        handleChangeClick,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        tokenBQtyLocal,
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        isSwapCopied,
        isSellTokenEth,
        tokenAQtyCoveredBySurplusBalance,
        tokenAQtyCoveredByWalletBalance,
        tokenASurplusMinusTokenARemainderNum,
        // tokenAWalletMinusTokenAQtyNum,
        // tokenASurplusMinusTokenAQtyNum,
        reverseTokens,
        // activeTokenListsChanged,
        // indicateActiveTokenListsChanged,
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
        acknowledgeToken,
        openGlobalPopup,
        dexBalancePrefs,
    } = props;

    // const [showManageTokenListContent, setShowManageTokenListContent] = useState(false);

    const isSellTokenSelector = fieldId === 'sell';
    const thisToken = isSellTokenSelector
        ? tokenPair.dataTokenA
        : tokenPair.dataTokenB;

    const isWithdrawFromDexDisabled = parseFloat(tokenADexBalance || '0') <= 0;
    const isWithdrawFromWalletDisabled = parseFloat(tokenABalance || '0') <= 0;

    const handleDexBalanceChange = () => {
        if (parseFloat(tokenADexBalance) <= 0) {
            setIsWithdrawFromDexChecked(false);
        } else if (dexBalancePrefs.swap.drawFromDexBal.isEnabled) {
            setIsWithdrawFromDexChecked(true);
        }
    };

    useEffect(() => {
        handleDexBalanceChange();
    }, [tokenADexBalance]);

    // const WithdrawTokensContent = (
    //     <div className={styles.surplus_toggle}>
    //         {isSellTokenSelector ? (
    //             <IconWithTooltip title='Use Exchange Balance' placement='bottom'>
    //                 <Toggle2
    //                     isOn={isWithdrawFromDexChecked}
    //                     handleToggle={() => setIsWithdrawFromDexChecked(!isWithdrawFromDexChecked)}
    //                     id='sell_token_withdrawal'
    //                     disabled={false}
    //                     // disabled={isWithdrawFromDexDisabled}
    //                 />
    //             </IconWithTooltip>
    //         ) : (
    //             <IconWithTooltip title='Save to Exchange Balance' placement='bottom'>
    //                 <Toggle2
    //                     isOn={isSaveAsDexSurplusChecked}
    //                     handleToggle={() =>
    //                         setIsSaveAsDexSurplusChecked(!isSaveAsDexSurplusChecked)
    //                     }
    //                     id='buy_token_withdrawal'
    //                 />
    //             </IconWithTooltip>
    //         )}
    //     </div>
    // );

    const walletAndSurplusBalanceNonLocaleString = props.sellToken
        ? tokenADexBalance && gasPriceInGwei
            ? isSellTokenEth
                ? (
                      parseFloat(tokenADexBalance) +
                      parseFloat(tokenABalance) -
                      gasPriceInGwei * 400000 * 1e-9
                  ).toFixed(18)
                : (
                      parseFloat(tokenBDexBalance) + parseFloat(tokenBBalance)
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

    const maxButton = (
        <button
            className={`${styles.max_button} ${styles.max_button_enable}`}
            onClick={() => {
                if (props.sellToken) {
                    setIsWithdrawFromDexChecked(false);
                } else {
                    setIsSaveAsDexSurplusChecked(false);
                }
                if (handleChangeClick && !isWithdrawFromWalletDisabled) {
                    handleChangeClick(walletAndSurplusBalanceNonLocaleString);
                }
            }}
        >
            Max
        </button>
    );

    const sellTokenSurplusClassname = isSellTokenSelector
        ? isWithdrawFromDexChecked
            ? styles.enabled_logo
            : null
        : isSaveAsDexSurplusChecked
        ? styles.enabled_logo
        : null;

    const sellTokenWalletClassname =
        (isSellTokenSelector && !isWithdrawFromDexChecked) ||
        (!isSellTokenSelector && !isSaveAsDexSurplusChecked) ||
        (isSellTokenSelector &&
            isSellTokenEth === false &&
            isWithdrawFromDexChecked &&
            tokenASurplusMinusTokenARemainderNum &&
            tokenASurplusMinusTokenARemainderNum < 0)
            ? styles.enabled_logo
            : styles.grey_logo;

    const sellTokenLogoClassname =
        (isSellTokenSelector && !isWithdrawFromDexChecked) ||
        (!isSellTokenSelector && !isSaveAsDexSurplusChecked)
            ? styles.grey_logo
            : null;

    const surplusColorStyle =
        (isSellTokenSelector && !isWithdrawFromDexChecked) ||
        (!isSellTokenSelector && !isSaveAsDexSurplusChecked)
            ? '#555555'
            : 'var(--text-grey-white)';

    function handleSurplusClick() {
        if (props.sellToken) {
            dexBalancePrefs.swap.drawFromDexBal.enable();
            setIsWithdrawFromDexChecked(true);
        } else {
            dexBalancePrefs.swap.outputToDexBal.enable();
            setIsSaveAsDexSurplusChecked(true);
        }
    }

    const walletContent = (
        <section className={styles.wallet_container}>
            <div
                className={`${styles.balance_with_pointer} ${sellTokenLogoClassname}`}
            >
                <IconWithTooltip
                    title={'Use Wallet Balance'}
                    placement='bottom'
                >
                    <div
                        className={`${styles.wallet_logo} ${sellTokenWalletClassname}`}
                        onClick={() => handleWalletBalanceClick()}
                    >
                        <img src={walletIcon} width='20' />
                    </div>
                </IconWithTooltip>
                <IconWithTooltip title={'Use DEX Balance'} placement='bottom'>
                    <div
                        className={`${styles.ambient_logo} ${sellTokenSurplusClassname}`}
                        style={{ color: surplusColorStyle }}
                        onClick={() => handleSurplusClick()}
                    >
                        <img src={ambientLogo} width='20' alt='surplus' />
                    </div>
                </IconWithTooltip>
                <div className={styles.balance_column}>
                    <div>
                        {isUserLoggedIn
                            ? walletAndSurplusBalanceLocaleString
                            : ''}
                    </div>
                </div>
            </div>
            {maxButton}
        </section>
    );
    // End of  Wallet balance function and styles-----------------------------

    // Surplus Content function and styles-----------------------------

    // const surplusColorStyle =
    //     (isSellTokenSelector && !isWithdrawFromDexChecked) ||
    //     (!isSellTokenSelector && !isSaveAsDexSurplusChecked)
    //         ? '#555555'
    //         : 'var(--text-highlight)';

    // function handleSurplusClick() {
    //     if (props.sellToken) {
    //         dexBalancePrefs.swap.drawFromDexBal.enable();
    //         setIsWithdrawFromDexChecked(true);
    //     } else {
    //         dexBalancePrefs.swap.outputToDexBal.enable();
    //         setIsSaveAsDexSurplusChecked(true);
    //     }
    // }
    // const sellTokenWalletClassname = isSellTokenSelector
    //     ? isWithdrawFromDexChecked
    //         ? styles.enabled_logo
    //         : null
    //     : isSaveAsDexSurplusChecked
    //     ? styles.enabled_logo
    //     : null;

    // const sellTokenLogoClassname =
    //     (isSellTokenSelector && !isWithdrawFromDexChecked) ||
    //     (!isSellTokenSelector && !isSaveAsDexSurplusChecked)
    //         ? styles.grey_logo
    //         : null;

    // const exchangeBalanceTitle = (
    //     <p
    //         style={{
    //             display: 'flex',
    //             alignItems: 'center',
    //             gap: '4px',
    //             cursor: 'pointer',
    //         }}
    //         onClick={() =>
    //             openGlobalPopup(
    //                 <ExchangeBalanceExplanation />,
    //                 'Exchange Balance',
    //                 'right',
    //             )
    //         }
    //     >
    //         Exchange Balance <AiOutlineQuestionCircle size={14} />
    //     </p>
    // );

    // const surplusContent = (
    //     <div className={styles.surplus_container}>
    //         <DefaultTooltip
    //             interactive
    //             title={exchangeBalanceTitle}
    //             placement={'bottom'}
    //             arrow
    //             enterDelay={100}
    //             leaveDelay={200}
    //         >
    //             <div
    //                 className={`${styles.balance_with_pointer} ${sellTokenLogoClassname}`}
    //                 style={{ color: surplusColorStyle }}
    //                 onClick={() => handleSurplusClick()}
    //             >
    //                 {surplusMaxButton}
    //                 <div className={styles.balance_column}>
    //                     {isUserLoggedIn && surplusBalanceLocaleString}
    //                     <div
    //                         style={{
    //                             color: isSellTokenSelector
    //                                 ? '#f6385b'
    //                                 : '#15be67',
    //                             fontSize: '9px',
    //                             // width: '50px'
    //                         }}
    //                     >
    //                         {isSellTokenSelector
    //                             ? sellTokenSurplusChange
    //                             : buyTokenSurplusChange}
    //                     </div>
    //                 </div>
    //                 <div
    //                     className={`${styles.wallet_logo} ${sellTokenWalletClassname}`}
    //                 >
    //                     <img
    //                         src={ambientLogo}
    //                         width='20'
    //                         alt='surplus'
    //                         color='var(--text-highlight)'
    //                     />
    //                 </div>
    //             </div>
    //         </DefaultTooltip>
    //     </div>
    // );

    // End of  Surplus content function and styles-----------------------------

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
                        importedTokens={importedTokensPlus}
                        setImportedTokens={setImportedTokens}
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
                        acknowledgeToken={acknowledgeToken}
                    />
                </Modal>
            )}
        </div>
    );
}
