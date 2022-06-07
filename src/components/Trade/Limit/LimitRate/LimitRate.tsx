import styles from './LimitRate.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';
import Toggle from '../../../Global/Toggle/Toggle';
import {
    useState,
    // ChangeEvent
} from 'react';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import Modal from '../../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../../Global/TokenSelectContainer/TokenSelectContainer';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { getAmbientTokens } from '../../../../tempdata';

interface LimitRateProps {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    fieldId: string;
    chainId: string;
    sellToken?: boolean;
    disable?: boolean;
    reverseTokens: () => void;

    // updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function LimitRate(props: LimitRateProps) {
    const { fieldId, tokenPair, tokensBank, chainId, disable, reverseTokens } = props;
    const [isChecked, setIsChecked] = useState<boolean>(false);

    const [isModalOpen, openModal, closeModal] = useModal();
    const tempTokenList = getAmbientTokens();

    const tokenSelectModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Select Token'>
            <TokenSelectContainer
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                tokenToUpdate={'B'}
                chainId={chainId}
                tokenList={tempTokenList}
                closeModal={closeModal}
                reverseTokens={reverseTokens}
            />
        </Modal>
    ) : null;

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-limit-rate-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                // onChange={(event) => updateOtherQuantity(event)}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*[.,]?[0-9]*$'
                disabled={disable}
                required
            />
        </div>
    );

    const withdrawTokensContent = (
        <span className={styles.surplus_toggle}>
            Withdraw tokens
            <div className={styles.toggle_container}>
                <Toggle
                    isOn={isChecked}
                    handleToggle={() => setIsChecked(!isChecked)}
                    Width={36}
                    id='tokens_withdrawal'
                />
            </div>
        </span>
    );

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>You Receive</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>{rateInput}</div>
                <div className={styles.token_select} onClick={openModal}>
                    <img
                        className={styles.token_list_img}
                        src={tokenPair.dataTokenB.logoURI}
                        width='30px'
                    />
                    <span className={styles.token_list_text}>{tokenPair.dataTokenB.symbol}</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                <span>Wallet: 69.420 | DEX: 0.00</span>
                {withdrawTokensContent}
            </div>
            {tokenSelectModalOrNull}
        </div>
    );
}
