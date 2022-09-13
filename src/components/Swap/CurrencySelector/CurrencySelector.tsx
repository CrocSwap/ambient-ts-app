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

interface CurrencySelectorProps {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    chainId: string;
    fieldId: string;
    direction: string;
    sellToken?: boolean;
    nativeBalance: string;
    tokenABalance: string;
    tokenBBalance: string;
    tokenADexBalance: string;
    tokenBDexBalance: string;
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
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        tokenAWalletMinusTokenAQtyNum,
        tokenBWalletPlusTokenBQtyNum,
        tokenASurplusMinusTokenAQtyNum,
        tokenBSurplusPlusTokenBQtyNum,
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
            {/* {fieldId === 'sell' ? 'Use Surplus' : 'Add to Surplus'} */}
            {/* {fieldId === 'sell'
                ? isWithdrawFromDexChecked
                    ? 'Use Exchange Surplus'
                    : 'Use Wallet Balance'
                : isSaveAsDexSurplusChecked
                ? 'Save as Exchange Surplus'
                : 'Withdraw to Wallet'} */}

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
                <IconWithTooltip title='Use Wallet Balance' placement='bottom'>
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

    const walletBalanceNonLocaleString =
        props.sellToken && tokenABalance !== ''
            ? parseFloat(tokenABalance).toString()
            : !props.sellToken && tokenBBalance !== ''
            ? parseFloat(tokenBBalance).toString()
            : '0';

    // const walletBalanceNonLocaleString =
    //     props.sellToken && tokenABalance !== ''
    //         ? parseFloat(tokenABalance).toString()
    //         : !props.sellToken && tokenBBalance !== ''
    //         ? parseFloat(tokenBBalance).toString()
    //         : '0';

    const walletBalanceLocaleString = props.sellToken
        ? !isWithdrawFromDexChecked
            ? tokenAWalletMinusTokenAQtyNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : parseFloat(tokenABalance || '0').toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : !isSaveAsDexSurplusChecked
        ? tokenBWalletPlusTokenBQtyNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : parseFloat(tokenBBalance || '0').toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });
    // const walletBalanceLocaleString =
    //     props.sellToken && tokenABalance !== ''
    //         ? parseFloat(tokenABalance).toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 2,
    //           })
    //         : !props.sellToken && tokenBBalance !== ''
    //         ? parseFloat(tokenBBalance).toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 2,
    //           })
    //         : '0';

    const surplusBalanceNonLocaleString =
        props.sellToken && tokenADexBalance !== ''
            ? parseFloat(tokenADexBalance).toString()
            : !props.sellToken && tokenBDexBalance !== ''
            ? parseFloat(tokenBDexBalance).toString()
            : '0';

    const surplusBalanceLocaleString = props.sellToken
        ? isWithdrawFromDexChecked
            ? tokenASurplusMinusTokenAQtyNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : parseFloat(tokenADexBalance || '0').toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : isSaveAsDexSurplusChecked
        ? tokenBSurplusPlusTokenBQtyNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : parseFloat(tokenBDexBalance || '0').toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    // const surplusBalanceLocaleString =
    //     props.sellToken && tokenADexBalance !== ''
    //         ? parseFloat(tokenADexBalance).toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 2,
    //           })
    //         : !props.sellToken && tokenBDexBalance !== ''
    //         ? parseFloat(tokenBDexBalance).toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 2,
    //           })
    //         : '0';

    // const surplusBalance = 0;
    // const surplusBalanceNonLocaleString = surplusBalance.toString();
    // const surplusBalanceLocaleString = surplusBalance.toLocaleString();

    return (
        <div className={styles.swapbox}>
            <div className={styles.direction}> </div>
            {/* <div className={styles.direction}>{direction}</div> */}
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <CurrencyQuantity fieldId={fieldId} handleChangeEvent={handleChangeEvent} />
                </div>
                <div className={styles.token_select} onClick={openModal}>
                    <img
                        className={styles.token_list_img}
                        src={thisToken.logoURI}
                        alt={thisToken.name}
                        width='30px'
                    />
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
                            (!isSellTokenSelector && !isSaveAsDexSurplusChecked)
                                ? '#ebebff'
                                : '#555555',
                    }}
                >
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
                            <IconWithTooltip title='wallet' placement='bottom'>
                                <MdAccountBalanceWallet
                                    size={15}
                                    color={
                                        (isSellTokenSelector && !isWithdrawFromDexChecked) ||
                                        (!isSellTokenSelector && !isSaveAsDexSurplusChecked)
                                            ? '#ebebff'
                                            : '#555555'
                                    }
                                />
                            </IconWithTooltip>
                        </div>
                        <div>{walletBalanceLocaleString}</div>
                    </div>
                    <IconWithTooltip title='surplus' placement='bottom'>
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
                            // className={props.sellToken ? styles.balance_with_pointer : null}
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
                            <div className={styles.wallet_logo}>
                                <img src={ambientLogo} width='15' alt='surplus' />
                            </div>
                            {surplusBalanceLocaleString}
                        </div>
                    </IconWithTooltip>
                </div>
                {/* {fieldId === 'limit-sell' ? DexBalanceContent : WithdrawTokensContent} */}
                {WithdrawTokensContent}
            </div>

            {tokenSelectModalOrNull}
        </div>
    );
}
