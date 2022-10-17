import styles from './CurrencySelector.module.css';
import CurrencyQuantity from '../CurrencyQuantity/CurrencyQuantity';
import { RiArrowDownSLine, RiListCheck } from 'react-icons/ri';
// import Toggle from '../../Global/Toggle/Toggle';
import { useState, ChangeEvent, Dispatch, SetStateAction, useEffect } from 'react';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { useModal } from '../../../components/Global/Modal/useModal';
import Modal from '../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../Global/TokenSelectContainer/TokenSelectContainer';
import Toggle2 from '../../Global/Toggle/Toggle2';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { MdAccountBalanceWallet } from 'react-icons/md';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';

interface CurrencySelectorProps {
    isUserLoggedIn: boolean;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    chainId: string;
    fieldId: string;
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
}

export default function CurrencySelector(props: CurrencySelectorProps) {
    const {
        isUserLoggedIn,
        tokenPair,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        // direction,
        fieldId,
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
        // userHasEnteredAmount,
        isSellTokenEth,
        tokenAQtyCoveredBySurplusBalance,
        tokenAQtyCoveredByWalletBalance,
        tokenASurplusMinusTokenARemainderNum,
        // tokenAWalletMinusTokenAQtyNum,
        // tokenASurplusMinusTokenAQtyNum,
        reverseTokens,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;

    const [isModalOpen, openModal, closeModal] = useModal();
    const [showManageTokenListContent, setShowManageTokenListContent] = useState(false);

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
                <IconWithTooltip title='Use Exchange Surplus' placement='bottom'>
                    <Toggle2
                        isOn={isWithdrawFromDexChecked}
                        handleToggle={() => setIsWithdrawFromDexChecked(!isWithdrawFromDexChecked)}
                        id='sell_token_withdrawal'
                        disabled={false}
                        // disabled={isWithdrawFromDexDisabled}
                    />
                </IconWithTooltip>
            ) : (
                <IconWithTooltip title='Save to Exchange Surplus' placement='bottom'>
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

    const tokenToUpdate = isSellTokenSelector ? 'A' : 'B';

    const footer = (
        <div
            className={styles.manage_token_list_container}
            onClick={() => setShowManageTokenListContent(true)}
        >
            <RiListCheck size={20} color='#CDC1FF' />
            Manage Token List
        </div>
    );
    const footerOrNull = !showManageTokenListContent ? footer : null;

    const tokenSelectModalOrNull = isModalOpen ? (
        <Modal
            onClose={closeModal}
            title='Select Token'
            centeredTitle
            handleBack={() => setShowManageTokenListContent(false)}
            showBackButton={showManageTokenListContent}
            footer={footerOrNull}
        >
            <TokenSelectContainer
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                setImportedTokens={setImportedTokens}
                searchableTokens={searchableTokens}
                tokenToUpdate={tokenToUpdate}
                chainId={chainId}
                tokenList={tokensBank}
                closeModal={closeModal}
                reverseTokens={reverseTokens}
                showManageTokenListContent={showManageTokenListContent}
                setShowManageTokenListContent={setShowManageTokenListContent}
                activeTokenListsChanged={activeTokenListsChanged}
                indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
            />
        </Modal>
    ) : null;

    const walletBalanceNonLocaleString = props.sellToken
        ? tokenABalance
            ? tokenABalance
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

    const surplusBalanceNonLocaleString = props.sellToken
        ? tokenADexBalance
            ? parseFloat(tokenADexBalance).toString()
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

    return (
        <div className={styles.swapbox}>
            <div className={styles.direction}> </div>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <CurrencyQuantity fieldId={fieldId} handleChangeEvent={handleChangeEvent} />
                </div>
                <div className={styles.token_select} onClick={openModal}>
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
                                ? '#ebebff'
                                : '#555555',
                    }}
                >
                    <IconWithTooltip title={'Wallet Balance'} placement='bottom'>
                        <div
                            className={styles.balance_with_pointer}
                            onClick={() => {
                                if (props.sellToken) {
                                    setIsWithdrawFromDexChecked(false);
                                    if (handleChangeClick && !isWithdrawFromWalletDisabled) {
                                        handleChangeClick(walletBalanceNonLocaleString);
                                    }
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
                                            ? '#ebebff'
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
                                    {isSellTokenSelector
                                        ? sellTokenWalletBalanceChange
                                        : buyTokenWalletBalanceChange}
                                </div>
                            </div>
                        </div>
                    </IconWithTooltip>
                    <IconWithTooltip title={'Exchange Surplus'} placement='bottom'>
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
                                        : '#ebebff',
                            }}
                            onClick={() => {
                                if (props.sellToken) {
                                    setIsWithdrawFromDexChecked(true);
                                    if (handleChangeClick && !isWithdrawFromDexDisabled) {
                                        handleChangeClick(surplusBalanceNonLocaleString);
                                    }
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
                                <img src={ambientLogo} width='20' alt='surplus' color='#ebebff' />
                            </div>

                            <div className={styles.balance_column}>
                                <div> {isUserLoggedIn ? surplusBalanceLocaleString : ''}</div>
                                <div
                                    style={{
                                        color: isSellTokenSelector ? '#f6385b' : '#15be67',
                                    }}
                                >
                                    {isSellTokenSelector
                                        ? sellTokenSurplusChange
                                        : buyTokenSurplusChange}
                                </div>
                            </div>
                        </div>
                    </IconWithTooltip>
                </div>
                {WithdrawTokensContent}
            </div>

            {tokenSelectModalOrNull}
        </div>
    );
}
