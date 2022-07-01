import { ChangeEvent, SetStateAction, useState } from 'react';
import styles from './RangeCurrencySelector.module.css';
import RangeCurrencyQuantity from '../RangeCurrencyQuantity/RangeCurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
import Toggle from '../../../Global/Toggle/Toggle';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { useModal } from '../../../../components/Global/Modal/useModal';
import Modal from '../../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../../Global/TokenSelectContainer/TokenSelectContainer';
import Toggle2 from '../../../Global/Toggle/Toggle2';

interface RangeCurrencySelectorProps {
    fieldId: string;
    chainId: string;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
    isWithdrawTokenAFromDexChecked: boolean;
    setIsWithdrawTokenAFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    isWithdrawTokenBFromDexChecked: boolean;
    setIsWithdrawTokenBFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    sellToken?: boolean;
    reverseTokens: () => void;
    truncatedTokenABalance: string;
    truncatedTokenBBalance: string;
    isTokenADisabled: boolean;
    isTokenBDisabled: boolean;
    isAdvancedMode: boolean;
    disable?: boolean;
}

export default function RangeCurrencySelector(props: RangeCurrencySelectorProps) {
    const {
        tokenPair,
        tokensBank,
        chainId,
        isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked,
        fieldId,
        sellToken,
        updateOtherQuantity,
        reverseTokens,
        truncatedTokenABalance,
        truncatedTokenBBalance,
        isTokenADisabled,
        isTokenBDisabled,
        isAdvancedMode,
    } = props;

    const thisToken = fieldId === 'A' ? tokenPair.dataTokenA : tokenPair.dataTokenB;
    const [showManageTokenListContent, setShowManageTokenListContent] = useState(false);

    const [isModalOpen, openModal, closeModal] = useModal();

    const tokenSelectModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Select Token'>
            <TokenSelectContainer
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                tokenToUpdate={fieldId}
                chainId={chainId}
                tokenList={tokensBank}
                closeModal={closeModal}
                reverseTokens={reverseTokens}
                showManageTokenListContent={showManageTokenListContent}
                setShowManageTokenListContent={setShowManageTokenListContent}
            />
        </Modal>
    ) : null;

    const DexBalanceContent = (
        <span className={styles.surplus_toggle}>
            {'Use exchange Balance'}
            {fieldId === 'A' ? (
                <Toggle2
                    isOn={isWithdrawTokenAFromDexChecked}
                    handleToggle={() =>
                        setIsWithdrawTokenAFromDexChecked(!isWithdrawTokenAFromDexChecked)
                    }
                    id='withdraw_from_dex'
                />
            ) : (
                <Toggle2
                    isOn={isWithdrawTokenBFromDexChecked}
                    handleToggle={() =>
                        setIsWithdrawTokenBFromDexChecked(!isWithdrawTokenBFromDexChecked)
                    }
                    id='withdraw_to_wallet'
                />
            )}
        </span>
    );

    const walletBalance =
        fieldId === 'A' && truncatedTokenABalance !== 'NaN'
            ? truncatedTokenABalance
            : fieldId === 'B' && truncatedTokenBBalance !== 'NaN'
            ? truncatedTokenBBalance
            : '0';

    // console.log({ fieldId });
    // console.log({ isTokenADisabled });
    const isFieldDisabled =
        (fieldId === 'A' && isTokenADisabled) || (fieldId === 'B' && isTokenBDisabled);

    return (
        <div className={styles.swapbox}>
            {sellToken && <span className={styles.direction}>Amounts</span>}
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <RangeCurrencyQuantity
                        fieldId={fieldId}
                        updateOtherQuantity={updateOtherQuantity}
                        disable={isFieldDisabled}
                        isAdvancedMode={isAdvancedMode}
                    />
                </div>
                <div className={styles.token_select} onClick={openModal}>
                    <img
                        className={styles.token_list_img}
                        src={thisToken.logoURI}
                        alt='ethereum logo'
                        width='30px'
                    />
                    <span className={styles.token_list_text}>{thisToken.symbol}</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                {fieldId === 'A' ? (
                    <span>Wallet: {walletBalance} | DEX: 0.00</span>
                ) : (
                    <span>Wallet: {walletBalance} | DEX: 0.00</span>
                )}

                {DexBalanceContent}
            </div>
            {tokenSelectModalOrNull}
        </div>
    );
}
