import { ethers } from 'ethers';
import styles from './CurrencySelector.module.css';
import CurrencyQuantity from '../CurrencyQuantity/CurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
// import Toggle from '../../Global/Toggle/Toggle';
import { useState, ChangeEvent, Dispatch, SetStateAction, useEffect } from 'react';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { useModal } from '../../../components/Global/Modal/useModal';
import Modal from '../../../components/Global/Modal/Modal';
import Toggle2 from '../../Global/Toggle/Toggle2';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { MdAccountBalanceWallet } from 'react-icons/md';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';
import { SoloTokenSelect } from '../../Global/TokenSelectContainer/SoloTokenSelect';
import { useSoloSearch } from '../../Global/TokenSelectContainer/hooks/useSoloSearch';
import { getRecentTokensParamsIF } from '../../../App/hooks/useRecentTokens';

interface CurrencySelectorProps {
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
    tokenBQtyLocal?: string;
    // nativeBalance: string;
    tokenABalance: string;
    tokenBBalance: string;
    tokenADexBalance: string;
    tokenBDexBalance: string;
    isSellTokenEth?: boolean;
    userHasEnteredAmount: boolean;
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
    getTokensByName: (searchName: string, chn: string, exact: boolean) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    importedTokensPlus: TokenIF[];
    getRecentTokens: (options?: getRecentTokensParamsIF | undefined) => TokenIF[];
    addRecentToken: (tkn: TokenIF) => void;
}

export default function CurrencySelector(props: CurrencySelectorProps) {
    const {
        provider,
        isUserLoggedIn,
        tokenPair,
        tokensBank,
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
        // userHasEnteredAmount,
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
    } = props;

    // const [showManageTokenListContent, setShowManageTokenListContent] = useState(false);

    const isSellTokenSelector = fieldId === 'sell';
    const thisToken = isSellTokenSelector ? tokenPair.dataTokenA : tokenPair.dataTokenB;

    const isWithdrawFromDexDisabled = parseFloat(tokenADexBalance || '0') <= 0;
    const isWithdrawFromWalletDisabled = parseFloat(tokenABalance || '0') <= 0;

    useEffect(() => {
        if (parseFloat(tokenADexBalance) <= 0) {
            setIsWithdrawFromDexChecked(false);
        }
    }, [tokenADexBalance]);

    const WithdrawTokensContent = (
        <div className={styles.surplus_toggle}>
            {isSellTokenSelector ? (
                <IconWithTooltip title='Use Exchange Balance' placement='bottom'>
                    <Toggle2
                        isOn={isWithdrawFromDexChecked}
                        handleToggle={() => setIsWithdrawFromDexChecked(!isWithdrawFromDexChecked)}
                        id='sell_token_withdrawal'
                        disabled={false}
                        // disabled={isWithdrawFromDexDisabled}
                    />
                </IconWithTooltip>
            ) : (
                <IconWithTooltip title='Save to Exchange Balance' placement='bottom'>
                    <Toggle2
                        isOn={isSaveAsDexSurplusChecked}
                        handleToggle={() =>
                            setIsSaveAsDexSurplusChecked(!isSaveAsDexSurplusChecked)
                        }
                        id='buy_token_withdrawal'
                    />
                </IconWithTooltip>
            )}
        </div>
    );

    const walletBalanceNonLocaleString = props.sellToken
        ? tokenABalance && gasPriceInGwei
            ? isSellTokenEth
                ? (parseFloat(tokenABalance) - gasPriceInGwei * 400000 * 1e-9).toFixed(18)
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

    const surplusBalanceNonLocaleString = props.sellToken ? tokenADexBalance : tokenBDexBalance;

    const surplusBalanceNonLocaleStringOffset = props.sellToken
        ? tokenADexBalance && gasPriceInGwei
            ? isSellTokenEth
                ? (parseFloat(tokenADexBalance) - gasPriceInGwei * 400000 * 1e-9).toFixed(18)
                : tokenADexBalance
            : ''
        : tokenBDexBalance
        ? parseFloat(tokenBDexBalance).toString()
        : '';

    const surplusBalanceLocaleString = props.sellToken
        ? tokenADexBalance
            ? parseFloat(tokenADexBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '...'
        : tokenBDexBalance
        ? parseFloat(tokenBDexBalance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

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

    const buyTokenSurplusChange =
        tokenBQtyLocal && isSaveAsDexSurplusChecked
            ? '(+' +
              parseFloat(tokenBQtyLocal).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) +
              ')'
            : '';

    const buyTokenWalletBalanceChange =
        tokenBQtyLocal && !isSaveAsDexSurplusChecked
            ? '(+' +
              parseFloat(tokenBQtyLocal).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) +
              ')'
            : '';

    const swapboxBottomOrNull = !isUserLoggedIn ? (
        // || (isUserLoggedIn && !userHasEnteredAmount) ? (
        <div className={styles.swapbox_bottom}></div>
    ) : (
        <div className={styles.swapbox_bottom}>
            <div
                className={styles.surplus_container}
                style={{
                    color:
                        (isSellTokenSelector && !isWithdrawFromDexChecked) ||
                        (!isSellTokenSelector && !isSaveAsDexSurplusChecked) ||
                        (isSellTokenSelector &&
                            isSellTokenEth === false &&
                            isWithdrawFromDexChecked &&
                            tokenASurplusMinusTokenARemainderNum &&
                            tokenASurplusMinusTokenARemainderNum < 0)
                            ? 'var(--text-highlight)'
                            : '#555555',
                }}
            >
                <section className={styles.left_bottom_container}>
                    <IconWithTooltip title={'Wallet Balance'} placement='bottom'>
                        <div
                            className={styles.balance_with_pointer}
                            onClick={() => {
                                if (props.sellToken) {
                                    setIsWithdrawFromDexChecked(false);
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
                                        (!isSellTokenSelector && !isSaveAsDexSurplusChecked) ||
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
                                        fontSize: '9px',
                                    }}
                                >
                                    {isSellTokenSelector
                                        ? sellTokenWalletBalanceChange
                                        : buyTokenWalletBalanceChange}
                                </div>
                            </div>
                        </div>
                    </IconWithTooltip>
                    {isSellTokenSelector &&
                    !isWithdrawFromDexChecked &&
                    walletBalanceNonLocaleString !== '0.0' ? (
                        <button
                            className={styles.max_button}
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
                    ) : null}
                </section>
            </div>
            <div className={styles.right_bottom_container}>
                <div className={styles.left_bottom_container}>
                    <IconWithTooltip title={'Exchange Balance'} placement='bottom'>
                        <div
                            className={`${styles.balance_with_pointer} ${
                                (isSellTokenSelector && !isWithdrawFromDexChecked) ||
                                (!isSellTokenSelector && !isSaveAsDexSurplusChecked)
                                    ? styles.grey_logo
                                    : null
                            }`}
                            style={{
                                color:
                                    (isSellTokenSelector && !isWithdrawFromDexChecked) ||
                                    (!isSellTokenSelector && !isSaveAsDexSurplusChecked)
                                        ? '#555555'
                                        : 'var(--text-highlight)',
                            }}
                            onClick={() => {
                                if (props.sellToken) {
                                    setIsWithdrawFromDexChecked(true);
                                } else {
                                    setIsSaveAsDexSurplusChecked(true);
                                }
                            }}
                        >
                            <div
                                className={`${styles.wallet_logo} ${
                                    isSellTokenSelector
                                        ? isWithdrawFromDexChecked
                                            ? styles.enabled_logo
                                            : null
                                        : isSaveAsDexSurplusChecked
                                        ? styles.enabled_logo
                                        : null
                                }`}
                            >
                                <img
                                    src={ambientLogo}
                                    width='20'
                                    alt='surplus'
                                    color='var(--text-highlight)'
                                />
                            </div>

                            <div className={styles.balance_column}>
                                <div> {isUserLoggedIn ? surplusBalanceLocaleString : ''}</div>
                                <div
                                    style={{
                                        color: isSellTokenSelector ? '#f6385b' : '#15be67',
                                        fontSize: '9px',
                                    }}
                                >
                                    {isSellTokenSelector
                                        ? sellTokenSurplusChange
                                        : buyTokenSurplusChange}
                                </div>
                            </div>
                        </div>
                    </IconWithTooltip>
                    {isSellTokenSelector &&
                    isWithdrawFromDexChecked &&
                    surplusBalanceNonLocaleString !== '0.0' ? (
                        <button
                            className={styles.max_button}
                            onClick={() => {
                                if (props.sellToken) {
                                    setIsWithdrawFromDexChecked(true);
                                } else {
                                    setIsSaveAsDexSurplusChecked(true);
                                }
                                if (handleChangeClick && !isWithdrawFromDexDisabled) {
                                    handleChangeClick(surplusBalanceNonLocaleStringOffset);
                                }
                            }}
                        >
                            Max
                        </button>
                    ) : null}
                </div>
                {WithdrawTokensContent}
            </div>
        </div>
    );

    const [isTokenModalOpen, openTokenModal, closeTokenModal] = useModal();
    const [showSoloSelectTokenButtons, setShowSoloSelectTokenButtons] = useState(true);
    const [outputTokens, validatedInput, setInput, searchType] = useSoloSearch(
        chainId,
        tokensBank,
        verifyToken,
        getTokenByAddress,
        getTokensByName,
    );

    const handleInputClear = () => {
        setInput('');
        const soloTokenSelectInput = document.getElementById(
            'solo-token-select-input',
        ) as HTMLInputElement;
        soloTokenSelectInput.value = '';
    };

    return (
        <div className={styles.swapbox}>
            <div className={styles.direction}> </div>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <CurrencyQuantity
                        fieldId={fieldId}
                        handleChangeEvent={(evt) => {
                            // console.log('change triggered from selector');
                            // console.log({ evt });
                            if (evt === undefined) return;
                            handleChangeEvent(evt);
                        }}
                    />
                </div>
                <div
                    className={`${styles.token_select} ${isSwapCopied && styles.pulse_animation}`}
                    onClick={openTokenModal}
                >
                    {thisToken.logoURI ? (
                        <img
                            className={styles.token_list_img}
                            src={thisToken.logoURI}
                            alt={thisToken.name}
                            width='30px'
                        />
                    ) : (
                        <NoTokenIcon tokenInitial={thisToken.symbol.charAt(0)} width='30px' />
                    )}
                    <div className={styles.token_list_text}>{thisToken.symbol}</div>
                    <RiArrowDownSLine size={27} />
                </div>
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
                        provider={provider}
                        closeModal={closeTokenModal}
                        chainId={chainId}
                        importedTokens={importedTokensPlus}
                        setImportedTokens={setImportedTokens}
                        getTokensByName={getTokensByName}
                        getTokenByAddress={getTokenByAddress}
                        verifyToken={verifyToken}
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
                    />
                </Modal>
            )}
        </div>
    );
}
