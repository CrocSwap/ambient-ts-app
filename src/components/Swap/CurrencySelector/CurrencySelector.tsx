import styles from './CurrencySelector.module.css';
import CurrencyQuantity from '../CurrencyQuantity/CurrencyQuantity';
import { RiArrowDownSLine, RiListCheck } from 'react-icons/ri';
// import Toggle from '../../Global/Toggle/Toggle';
import { useState, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { useModal } from '../../../components/Global/Modal/useModal';
import Modal from '../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../Global/TokenSelectContainer/TokenSelectContainer';
import Toggle2 from '../../Global/Toggle/Toggle2';

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
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    handleChangeClick: (value: string) => void;
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
        direction,
        fieldId,
        handleChangeEvent,
        handleChangeClick,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        tokenABalance,
        tokenBBalance,
        reverseTokens,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
        nativeBalance,
    } = props;

    const [isModalOpen, openModal, closeModal] = useModal();
    const [showManageTokenListContent, setShowManageTokenListContent] = useState(false);

    const thisToken = fieldId === 'sell' ? tokenPair.dataTokenA : tokenPair.dataTokenB;

    const WithdrawTokensContent = (
        <div className={styles.surplus_toggle}>
            {fieldId === 'sell'
                ? isWithdrawFromDexChecked
                    ? 'Use Exchange Surplus'
                    : 'Use Wallet Balance'
                : isSaveAsDexSurplusChecked
                ? 'Save as Exchange Surplus'
                : 'Withdraw to Wallet'}

            {fieldId === 'sell' ? (
                // <Toggle
                //     isOn={isWithdrawFromDexChecked}
                //     handleToggle={() => setIsWithdrawFromDexChecked(!isWithdrawFromDexChecked)}
                //     Width={36}
                //     id='sell_token_withdrawal'
                // />
                <Toggle2
                    isOn={isWithdrawFromDexChecked}
                    handleToggle={() => setIsWithdrawFromDexChecked(!isWithdrawFromDexChecked)}
                    id='sell_token_withdrawal'
                />
            ) : (
                <Toggle2
                    isOn={isSaveAsDexSurplusChecked}
                    handleToggle={() => setIsSaveAsDexSurplusChecked(!isSaveAsDexSurplusChecked)}
                    id='buy_token_withdrawal'
                />
            )}
        </div>
    );

    const tokenToUpdate = fieldId === 'sell' ? 'A' : 'B';

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

    const walletBalance =
        props.sellToken && tokenABalance !== 'NaN'
            ? tokenABalance
            : !props.sellToken && tokenBBalance !== 'NaN'
            ? tokenBBalance
            : '0';

    return (
        <div className={styles.swapbox}>
            <div className={styles.direction}>{direction}</div>
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
                <div className={styles.surplus_container}>
                    <div
                        onClick={() => {
                            handleChangeClick(walletBalance);
                        }}
                    >
                        Wallet: {walletBalance}{' '}
                    </div>{' '}
                    |{' '}
                    <div
                        onClick={() => {
                            handleChangeClick('0');
                        }}
                    >
                        Surplus: 0
                    </div>
                </div>
                {/* {fieldId === 'limit-sell' ? DexBalanceContent : WithdrawTokensContent} */}
                {WithdrawTokensContent}
            </div>

            {tokenSelectModalOrNull}
        </div>
    );
}
