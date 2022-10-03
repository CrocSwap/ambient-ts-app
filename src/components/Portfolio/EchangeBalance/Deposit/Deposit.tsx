import styles from './Deposit.module.css';
import DepositButton from './DepositButton/DepositButton';
import DepositCurrencySelector from './DepositCurrencySelector/DepositCurrencySelector';
import { defaultTokens } from '../../../../utils/data/defaultTokens';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setToken } from '../../../../utils/state/temp';

interface PortfolioDepositProps {
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    tempTokenSelection: TokenIF;
}

export default function Deposit(props: PortfolioDepositProps) {
    const { openGlobalModal, closeGlobalModal, tempTokenSelection } = props;
    const dispatch = useAppDispatch();

    const chooseToken = (tok: TokenIF) => {
        console.log(tok);
        dispatch(setToken(tok));
        closeGlobalModal();
    };

    const chooseTokenDiv = (
        <div>
            {defaultTokens
                .filter((token: TokenIF) => token.chainId === parseInt('0x5'))
                .map((token: TokenIF) => (
                    <button key={'button_to_set_' + token.name} onClick={() => chooseToken(token)}>
                        {token.name}
                    </button>
                ))}
        </div>
    );

    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text}>
                Deposit tokens to Ambient Finance exchange wallet
            </div>
            <DepositCurrencySelector
                fieldId='exchange-balance-deposit'
                onClick={() => openGlobalModal(chooseTokenDiv)}
                tempTokenSelection={tempTokenSelection}
            />
            <DepositButton
                onClick={() => {
                    console.log('clicked');
                }}
            />
        </div>
    );
}
