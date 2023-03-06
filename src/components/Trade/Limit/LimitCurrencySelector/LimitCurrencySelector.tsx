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
import { MdAccountBalanceWallet } from 'react-icons/md';
import ambientLogo from '../../../../assets/images/logos/ambient_logo.svg';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import { SoloTokenSelect } from '../../../Global/TokenSelectContainer/SoloTokenSelect';
import { getRecentTokensParamsIF } from '../../../../App/hooks/useRecentTokens';
import ExchangeBalanceExplanation from '../../../Global/Informational/ExchangeBalanceExplanation';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { tokenMethodsIF } from '../../../../App/hooks/useToken';

// interface for component props
interface propsIF {
    provider?: ethers.providers.Provider;
    isUserLoggedIn: boolean | undefined;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
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
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
    gasPriceInGwei: number | undefined;
    isOrderCopied: boolean;
    importedTokensPlus: TokenIF[];
    getRecentTokens: (options?: getRecentTokensParamsIF | undefined) => TokenIF[];
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
    uTokens: tokenMethodsIF;
}

// central react functional component
export default function LimitCurrencySelector(props: propsIF) {
    const {
        provider,
        isUserLoggedIn,
        tokenPair,
        setImportedTokens,
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
        tokenAQtyCoveredBySurplusBalance,
        tokenAQtyCoveredByWalletBalance,
        tokenASurplusMinusTokenARemainderNum,
        gasPriceInGwei,
        handleChangeClick,
        isOrderCopied,
        importedTokensPlus,
        getRecentTokens,
        addRecentToken,
        tokenAorB,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        openGlobalPopup,
        uTokens
    } = props;

    const thisToken = fieldId === 'sell' ? tokenPair.dataTokenA : tokenPair.dataTokenB;

    const isSellTokenSelector = fieldId === 'sell';

    // IMPORTANT!  The Limit Order module is the one only transaction configurator
    // ... in the app which has an input field with no token selector.  For that
    // ... reason, `LimitCurrencySelector.tsx` file needs to be coded separately
    // ... from its counterparts in the Swap/Market/Range modules, even if we use
    // ... a common element for those modules in the future.

    const modalCloseCustom = (): void => setInput('');

    const [isTokenModalOpen, openTokenModal, closeTokenModal] = useModal(modalCloseCustom);
    const [showSoloSelectTokenButtons, setShowSoloSelectTokenButtons] = useState(true);
    // const [outputTokens, validatedInput, setInput, searchType] = useSoloSearch(
    //     chainId,
    //     tokensBank,
    //     verifyToken,
    //     getTokenByAddress,
    //     getTokensByName,
    // );

    const handleInputClear = (): void => {
        setInput('');
        const soloTokenSelectInput = document.getElementById(
            'solo-token-select-input',
        ) as HTMLInputElement;
        soloTokenSelectInput.value = '';
    };

    const tokenSelect = (
        <div
            className={`${styles.token_select} ${isOrderCopied && styles.pulse_animation}`}
            onClick={openTokenModal}
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
                <NoTokenIcon tokenInitial={thisToken.symbol.charAt(0)} width='30px' />
            )}
            <span className={styles.token_list_text}>{thisToken.symbol}</span>
            <RiArrowDownSLine size={27} />
        </div>
    );

    // const WithdrawTokensContent = (
    //     <span className={styles.surplus_toggle}>
    //         <IconWithTooltip title='Use Exchange Balance' placement='bottom'>
    //             <Toggle2
    //                 isOn={isWithdrawFromDexChecked}
    //                 handleToggle={() => setIsWithdrawFromDexChecked(!isWithdrawFromDexChecked)}
    //                 id='sell_token_withdrawal'
    //                 disabled={false}
    //                 // disabled={parseFloat(tokenADexBalance) <= 0}
    //             />
    //         </IconWithTooltip>
    //     </span>
    // );

    const isWithdrawFromDexDisabled = parseFloat(tokenADexBalance || '0') <= 0;
    const isWithdrawFromWalletDisabled = parseFloat(tokenABalance || '0') <= 0;

    const walletBalanceNonLocaleString =
        tokenABalance && gasPriceInGwei
            ? isSellTokenEth
                ? (parseFloat(tokenABalance) - gasPriceInGwei * 400000 * 1e-9).toFixed(18)
                : tokenABalance
            : '';

    const walletBalanceLocaleString = tokenABalance
        ? parseFloat(tokenABalance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

    const surplusBalanceNonLocaleString =
        tokenADexBalance && gasPriceInGwei
            ? isSellTokenEth
                ? (parseFloat(tokenADexBalance) - gasPriceInGwei * 400000 * 1e-9).toFixed(18)
                : tokenADexBalance
            : '';

    const surplusBalanceLocaleString = tokenADexBalance
        ? parseFloat(tokenADexBalance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

    // const surplusBalanceLocaleString = isWithdrawFromDexChecked
    //     ? isSellTokenEth && tokenASurplusMinusTokenARemainderNum
    //         ? tokenASurplusMinusTokenARemainderNum.toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 2,
    //           })
    //         : tokenASurplusMinusTokenAQtyNum.toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 2,
    //           })
    //     : parseFloat(tokenADexBalance || '0').toLocaleString(undefined, {
    //           minimumFractionDigits: 2,
    //           maximumFractionDigits: 2,
    //       });

    const sellTokenSurplusChange =
        tokenAQtyCoveredBySurplusBalance && tokenAQtyCoveredBySurplusBalance > 0
            ? '(-' +
              tokenAQtyCoveredBySurplusBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) +
              ')'
            : '';

    const sellTokenWalletBalanceChange =
        tokenAQtyCoveredByWalletBalance && tokenAQtyCoveredByWalletBalance > 0
            ? '(-' +
              tokenAQtyCoveredByWalletBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) +
              ')'
            : '';

    const walletBalanceMaxButton =
        isSellTokenSelector &&
        !isWithdrawFromDexChecked &&
        walletBalanceNonLocaleString !== '0.0' ? (
            <button
                className={`${styles.max_button} ${styles.max_button_enable}`}
                onClick={() => {
                    if (props.sellToken) {
                        setIsWithdrawFromDexChecked(false);
                    } else {
                        setIsSaveAsDexSurplusChecked(false);
                    }
                    if (handleChangeClick && !isWithdrawFromWalletDisabled) {
                        handleChangeClick(walletBalanceNonLocaleString);
                    }
                }}
            >
                Max
            </button>
        ) : (
            <p className={styles.max_button} />
        );

    const surplusMaxButton =
        isSellTokenSelector &&
        isWithdrawFromDexChecked &&
        surplusBalanceNonLocaleString !== '0.0' ? (
            <button
                className={`${styles.max_button} ${styles.max_button_enable}`}
                onClick={() => {
                    if (props.sellToken) {
                        setIsWithdrawFromDexChecked(true);
                    } else {
                        setIsSaveAsDexSurplusChecked(true);
                    }
                    if (handleChangeClick && !isWithdrawFromDexDisabled) {
                        handleChangeClick(surplusBalanceNonLocaleString);
                    }
                }}
            >
                Max
            </button>
        ) : (
            <p className={styles.max_button} />
        );

    const walletContent = (
        <div className={styles.main_wallet_container}>
            <IconWithTooltip
                title={'Wallet Balance'}
                placement='bottom'
                style={{ display: 'flex', alignItems: 'center' }}
            >
                <div
                    className={styles.balance_with_pointer}
                    onClick={() => {
                        if (props.sellToken) {
                            setIsWithdrawFromDexChecked(false);
                            // if (handleChangeClick && !isWithdrawFromWalletDisabled) {
                            //     handleChangeClick(walletBalanceNonLocaleString);
                            // }
                        } else {
                            setIsSaveAsDexSurplusChecked(false);
                        }
                    }}
                >
                    <div className={styles.wallet_logo}>
                        <MdAccountBalanceWallet
                            size={20}
                            color={
                                (isSellTokenSelector && !isWithdrawFromDexChecked) ||
                                (isSellTokenSelector &&
                                    isSellTokenEth === false &&
                                    isWithdrawFromDexChecked &&
                                    tokenASurplusMinusTokenARemainderNum &&
                                    tokenASurplusMinusTokenARemainderNum < 0)
                                    ? 'var(--text-highlight)'
                                    : '#555555'
                            }
                        />
                    </div>
                    <div className={styles.balance_column}>
                        <div>{isUserLoggedIn ? walletBalanceLocaleString : ''}</div>
                        <div
                            style={{
                                color: isSellTokenSelector ? '#f6385b' : '#15be67',
                            }}
                        >
                            <p style={{ fontSize: '9px' }}> {sellTokenWalletBalanceChange}</p>
                        </div>
                    </div>
                </div>
                {walletBalanceMaxButton}
            </IconWithTooltip>
        </div>
    );
    const exchangeBalanceTitle = (
        <p
            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            onClick={() =>
                openGlobalPopup(<ExchangeBalanceExplanation />, 'Exchange Balance', 'right')
            }
        >
            Exchange Balance <AiOutlineQuestionCircle size={14} />
        </p>
    );

    const surplusContent = (
        <div className={styles.main_exchange_container}>
            <DefaultTooltip
                interactive
                title={exchangeBalanceTitle}
                // placement={'bottom'}
                placement={'bottom'}
                arrow
                enterDelay={100}
                leaveDelay={200}
            >
                <div
                    className={`${styles.balance_with_pointer} ${
                        isSellTokenSelector && !isWithdrawFromDexChecked ? styles.grey_logo : null
                    }`}
                    style={{
                        color:
                            isSellTokenSelector && !isWithdrawFromDexChecked
                                ? '#555555'
                                : 'var(--text-highlight)',
                    }}
                    onClick={() => {
                        if (props.sellToken) {
                            setIsWithdrawFromDexChecked(true);
                            // if (handleChangeClick && !isWithdrawFromDexDisabled) {
                            //     handleChangeClick(surplusBalanceNonLocaleString);
                            // }
                        } else {
                            setIsSaveAsDexSurplusChecked(true);
                        }
                    }}
                >
                    {surplusMaxButton}
                    <div className={styles.balance_column}>
                        <div> {isUserLoggedIn ? surplusBalanceLocaleString : ''}</div>
                        <div
                            style={{
                                color: isSellTokenSelector ? '#f6385b' : '#15be67',
                            }}
                        >
                            <p style={{ fontSize: '9px' }}> {sellTokenSurplusChange}</p>
                        </div>
                    </div>
                    <div
                        className={`${styles.wallet_logo} ${
                            isSellTokenSelector ? styles.enabled_logo : null
                        }`}
                    >
                        <img src={ambientLogo} width='20' alt='surplus' />
                    </div>
                </div>
            </DefaultTooltip>
        </div>
    );

    const balanceDisplayOrNull = isSellTokenSelector ? (
        !isUserLoggedIn ? (
            <div className={styles.swapbox_bottom} />
        ) : (
            <div className={styles.swapbox_bottom}>
                {walletContent}
                {surplusContent}
            </div>
        )
    ) : null;

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}> </span>
            {/* <span className={styles.direction}>{direction}</span> */}
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input} id='limit_sell_qty'>
                    <LimitCurrencyQuantity
                        value={tokenAorB === 'A' ? tokenAInputQty : tokenBInputQty}
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
                        importedTokens={importedTokensPlus}
                        setImportedTokens={setImportedTokens}
                        showSoloSelectTokenButtons={showSoloSelectTokenButtons}
                        setShowSoloSelectTokenButtons={setShowSoloSelectTokenButtons}
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
                        uTokens={uTokens}
                    />
                </Modal>
            )}
        </div>
    );
}
