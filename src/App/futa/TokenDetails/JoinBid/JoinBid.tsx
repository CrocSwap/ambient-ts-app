import { MdClose } from 'react-icons/md';
import styles from './JoinBid.module.css';
import { useContext } from 'react';
import { CurrencySelector } from '../../../../components/Form/CurrencySelector';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TokenBalanceContext } from '../../../../contexts/TokenBalanceContext';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { TokenIF } from '../../../../ambient-utils/types';

interface Props {
    handleClose: () => void;
    selectedToken: TokenIF;
    setQty: React.Dispatch<React.SetStateAction<string | undefined>>;
    setTokenModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    inputValue: string;
    setInputValue: React.Dispatch<React.SetStateAction<string>>;
}
export default function JoinBid(props: Props) {
    const {
        handleClose,
        selectedToken,
        setQty,
        setTokenModalOpen,
        inputValue,
        setInputValue,
    } = props;

    return (
        <div className={styles.container}>
            <header>
                <span />
                Join Bid
                <MdClose color='#8b98a5' onClick={handleClose} />
            </header>

            <div className={styles.joinBidContainer}>
                <div className={styles.fdvContainer}>
                    <p className={styles.label}>FDV</p>
                    <input type='text' placeholder='$30,000' />
                </div>
                <div className={styles.bidSizeContainer}>
                    <p className={styles.label}>Bid size</p>
                    <CurrencySelector
                        selectedToken={selectedToken}
                        setQty={setQty}
                        setTokenModalOpen={setTokenModalOpen}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        customBorderRadius='0px'
                    />
                </div>
            </div>
        </div>
    );
}
