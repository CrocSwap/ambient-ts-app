// START: Import React and Dongles
import { useState } from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import React Functional Components
import LimitCurrencyQuantity from '../LimitCurrencyQuantity/LimitCurrencyQuantity';
import Toggle from '../../../Global/Toggle/Toggle';

// START: Import Local Files
import styles from './LimitCurrencySelector.module.css';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import Modal from '../../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../../Global/TokenSelectContainer/TokenSelectContainer';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { getAmbientTokens } from '../../../../tempdata';

// interface for component props
interface LimitCurrencySelectorProps {
    tokenData: TokenIF;
    chainId: string;
    fieldId: string;
    direction: string;
    sellToken?: boolean;
    // updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

// central react functional component
export default function LimitCurrencySelector(props: LimitCurrencySelectorProps) {
    const { tokenData, chainId, fieldId, direction } = props;

    const [isModalOpen, openModal, closeModal] = useModal();
    const tempTokenList = getAmbientTokens();

    const tokenSelectModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Select Token'>
            <TokenSelectContainer
                tokenToUpdate={fieldId === 'sell' ? 'A' : 'B'}
                chainId={chainId}
                tokenList={tempTokenList}
                closeModal={closeModal}
            />
        </Modal>
    ) : null;

    const [isChecked, setIsChecked] = useState<boolean>(false);

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
                    <LimitCurrencyQuantity fieldId={fieldId} />
                </div>
                <div className={styles.token_select} onClick={openModal}>
                    <img
                        className={styles.token_list_img}
                        src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt='ethreum'
                        width='30px'
                    />
                    <span className={styles.token_list_text}>{tokenData.symbol}</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                {fieldId === 'buy' ? <span>Wallet: 69.420 | DEX: 0.00</span> : null}
                {fieldId === 'buy' && DexBalanceContent}
            </div>
            {tokenSelectModalOrNull}
        </div>
    );
}
