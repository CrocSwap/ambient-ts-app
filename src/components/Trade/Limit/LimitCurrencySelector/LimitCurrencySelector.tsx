// START: Import React and Dongles
import { useState, ChangeEvent } from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import React Functional Components
import LimitCurrencyQuantity from '../LimitCurrencyQuantity/LimitCurrencyQuantity';
import Toggle from '../../../Global/Toggle/Toggle';

// START: Import Local Files
import styles from './LimitCurrencySelector.module.css';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import Modal from '../../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../../Global/TokenSelectContainer/TokenSelectContainer';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { getAmbientTokens } from '../../../../tempdata';

// interface for component props
interface LimitCurrencySelectorProps {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    chainId: string;
    fieldId: string;
    direction: string;
    sellToken?: boolean;
    reverseTokens: () => void;

    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

// central react functional component
export default function LimitCurrencySelector(props: LimitCurrencySelectorProps) {
    const {
        tokenPair,
        tokensBank,
        chainId,
        fieldId,
        direction,
        updateOtherQuantity,
        reverseTokens,
    } = props;

    const thisToken = fieldId === 'buy' ? tokenPair.dataTokenA : tokenPair.dataTokenB;

    const [isModalOpen, openModal, closeModal] = useModal();
    const tempTokenList = getAmbientTokens();

    const tokenSelectModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Select Token'>
            <TokenSelectContainer
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                tokenToUpdate={'A'}
                chainId={chainId}
                tokenList={tempTokenList}
                closeModal={closeModal}
                reverseTokens={reverseTokens}
            />
        </Modal>
    ) : null;

    const [isChecked, setIsChecked] = useState<boolean>(false);

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
            Use DEX balance
            <div className={styles.toggle_container}>
                <Toggle
                    isOn={isChecked}
                    handleToggle={() => setIsChecked(!isChecked)}
                    Width={36}
                    id='surplus_liquidity'
                />
            </div>
        </span>
    );

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>{direction}</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <LimitCurrencyQuantity
                        fieldId={fieldId}
                        updateOtherQuantity={updateOtherQuantity}
                    />
                </div>
                {fieldId === 'buy' && tokenSelect}
            </div>
            <div className={styles.swapbox_bottom}>
                {fieldId === 'buy' ? <span>Wallet: 69.420 | DEX: 0.00</span> : null}
                {fieldId === 'buy' && DexBalanceContent}
            </div>
            {tokenSelectModalOrNull}
        </div>
    );
}
