// START: Import React and Dongles
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import React Functional Components
import LimitCurrencyQuantity from '../LimitCurrencyQuantity/LimitCurrencyQuantity';

// START: Import Local Files
import styles from './LimitCurrencySelector.module.css';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import Modal from '../../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../../Global/TokenSelectContainer/TokenSelectContainer';
import { useModal } from '../../../../components/Global/Modal/useModal';
import Toggle2 from '../../../Global/Toggle/Toggle2';

// interface for component props
interface LimitCurrencySelectorProps {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    chainId: string;
    fieldId: string;
    direction: string;
    sellToken?: boolean;
    reverseTokens: () => void;
    tokenABalance: string;
    tokenBBalance: string;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
}

// central react functional component
export default function LimitCurrencySelector(props: LimitCurrencySelectorProps) {
    const {
        tokenPair,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        fieldId,
        direction,
        handleChangeEvent,
        reverseTokens,
        tokenABalance,
        tokenBBalance,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;

    const thisToken = fieldId === 'sell' ? tokenPair.dataTokenA : tokenPair.dataTokenB;
    const [showManageTokenListContent, setShowManageTokenListContent] = useState(false);

    const [isModalOpen, openModal, closeModal] = useModal();

    const tokenToUpdate = fieldId === 'sell' ? 'A' : 'B';

    const tokenSelectModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Select Token' centeredTitle>
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

    // IMPORTANT!  The Limit Order module is the one only transaction configurator
    // ... in the app which has an input field with no token selector.  For that
    // ... reason, `LimitCurrencySelector.tsx` file needs to be coded separately
    // ... from its counterparts in the Swap/Market/Range modules, even if we use
    // ... a common element for those modules in the future.

    const tokenSelect = (
        <div className={styles.token_select} onClick={openModal}>
            <img
                className={styles.token_list_img}
                src={thisToken.logoURI}
                alt={thisToken.name + 'token logo'}
                width='30px'
            />
            <span className={styles.token_list_text}>{thisToken.symbol}</span>
            <RiArrowDownSLine size={27} />
        </div>
    );

    const DexBalanceContent = (
        <span className={styles.surplus_toggle}>
            {fieldId === 'sell' ? 'Use Exchange Surplus' : 'Save as Exchange Surplus'}
            {/* {fieldId === 'sell'
                ? isWithdrawFromDexChecked
                    ? 'Use Exchange Surplus'
                    : 'Use Wallet Balance'
                : isSaveAsDexSurplusChecked
                ? 'Save as Exchange Surplus'
                : 'Withdraw to Wallet'} */}

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
        </span>
    );

    const walletBalance =
        props.sellToken && tokenABalance !== ''
            ? parseFloat(tokenABalance).toLocaleString()
            : !props.sellToken && tokenBBalance !== ''
            ? parseFloat(tokenBBalance).toLocaleString()
            : '0';

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}> </span>
            {/* <span className={styles.direction}>{direction}</span> */}
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <LimitCurrencyQuantity
                        fieldId={fieldId}
                        handleChangeEvent={handleChangeEvent}
                    />
                </div>
                {fieldId === 'buy' || fieldId === 'sell' ? tokenSelect : null}
            </div>
            <div className={styles.swapbox_bottom}>
                {fieldId === 'sell' ? (
                    <span>Wallet: {walletBalance} | Surplus: 0</span>
                ) : (
                    <span>Wallet: {walletBalance} | Surplus: 0</span>
                )}
                {fieldId === 'buy' || fieldId === 'sell' ? DexBalanceContent : null}
            </div>
            {tokenSelectModalOrNull}
        </div>
    );
}
