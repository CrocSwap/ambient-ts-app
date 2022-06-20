import { ChangeEvent, SetStateAction } from 'react';
import styles from './RangeCurrencySelector.module.css';
import RangeCurrencyQuantity from '../RangeCurrencyQuantity/RangeCurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
import Toggle from '../../../Global/Toggle/Toggle';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { useModal } from '../../../../components/Global/Modal/useModal';
import Modal from '../../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../../Global/TokenSelectContainer/TokenSelectContainer';

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
    } = props;

    const thisToken = fieldId === 'A' ? tokenPair.dataTokenA : tokenPair.dataTokenB;

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
            />
        </Modal>
    ) : null;

    const DexBalanceContent = (
        <span className={styles.surplus_toggle}>
            {'Use DEX Balance'}
            <div className={styles.toggle_container}>
                {fieldId === 'A' ? (
                    <Toggle
                        isOn={isWithdrawTokenAFromDexChecked}
                        handleToggle={() =>
                            setIsWithdrawTokenAFromDexChecked(!isWithdrawTokenAFromDexChecked)
                        }
                        Width={36}
                        id='withdraw_from_dex'
                    />
                ) : (
                    <Toggle
                        isOn={isWithdrawTokenBFromDexChecked}
                        handleToggle={() =>
                            setIsWithdrawTokenBFromDexChecked(!isWithdrawTokenBFromDexChecked)
                        }
                        Width={36}
                        id='withdraw_to_wallet'
                    />
                )}
            </div>
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
