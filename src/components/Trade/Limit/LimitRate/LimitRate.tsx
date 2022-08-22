import styles from './LimitRate.module.css';
// import { RiArrowDownSLine } from 'react-icons/ri';
// import Toggle from '../../../Global/Toggle/Toggle';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';

import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
// import { useState, useEffect } from 'react';
// import Modal from '../../../../components/Global/Modal/Modal';
// import TokenSelectContainer from '../../../Global/TokenSelectContainer/TokenSelectContainer';
// import { useModal } from '../../../../components/Global/Modal/useModal';
// import { getAmbientTokens } from '../../../../tempdata';
import { setLimitPrice } from '../../../../utils/state/tradeDataSlice';

interface LimitRateProps {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    fieldId: string;
    chainId: string;
    sellToken?: boolean;
    disable?: boolean;
    reverseTokens: () => void;
    setLimitRate: React.Dispatch<React.SetStateAction<string>>;
    poolPriceNonDisplay: number | undefined;
    insideTickDisplayPrice: number;
    limitRate: string;
    // updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function LimitRate(props: LimitRateProps) {
    const {
        fieldId,
        //  tokenPair,
        //   tokensBank,
        //   chainId,
        disable,
        setLimitRate,
        // insideTickDisplayPrice,
        //   reverseTokens
    } = props;
    const dispatch = useAppDispatch();
    // const [isChecked, setIsChecked] = useState<boolean>(false);

    // const [isModalOpen, openModal, closeModal] = useModal();
    // const tempTokenList = getAmbientTokens();

    // const tokenSelectModalOrNull = isModalOpen ? (
    //     <Modal onClose={closeModal} title='Select Token'>
    //         <TokenSelectContainer
    //             tokenPair={tokenPair}
    //             tokensBank={tokensBank}
    //             tokenToUpdate={'B'}
    //             chainId={chainId}
    //             tokenList={tempTokenList}
    //             closeModal={closeModal}
    //             reverseTokens={reverseTokens}
    //         />
    //     </Modal>
    // ) : null;

    const handleLimitChange = (value: string) => {
        dispatch(setLimitPrice(value));
        setLimitRate(value);
    };

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                onChange={(event) => handleLimitChange(event.target.value)}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*[.,]?[0-9]*$'
                disabled={disable}
                required
                value={props.limitRate}
            />
        </div>
    );

    // const withdrawTokensContent = (
    //     <span className={styles.surplus_toggle}>
    //         Withdraw tokens
    //         <div className={styles.toggle_container}>
    //             <Toggle
    //                 isOn={isChecked}
    //                 handleToggle={() => setIsChecked(!isChecked)}
    //                 Width={36}
    //                 id='tokens_withdrawal'
    //             />
    //         </div>
    //     </span>
    // );

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>Price</span>
            <div className={styles.swap_input}>{rateInput}</div>
        </div>
    );
}
