import styles from './Deposit.module.css';
import DepositButton from './DepositButton/DepositButton';
import DepositCurrencySelector from './DepositCurrencySelector/DepositCurrencySelector';
import { defaultTokens } from '../../../../utils/data/defaultTokens';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setToken } from '../../../../utils/state/temp';
import { CrocEnv } from '@crocswap-libs/sdk';
import { useState } from 'react';

interface PortfolioDepositProps {
    crocEnv: CrocEnv | undefined;
    connectedAccount: string;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    tempTokenSelection: TokenIF;
}

export default function Deposit(props: PortfolioDepositProps) {
    const { crocEnv, connectedAccount, openGlobalModal, closeGlobalModal, tempTokenSelection } =
        props;
    const dispatch = useAppDispatch();

    const [depositQty, setDepositQty] = useState<number | undefined>();

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

    const depositFn = () => {
        if (crocEnv && depositQty) {
            crocEnv.token(tempTokenSelection.address).deposit(depositQty, connectedAccount);
            // crocEnv.token(tempTokenSelection.address).deposit(1, wallet.address);
        }
    };

    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text}>
                Deposit tokens to Ambient Finance exchange wallet
            </div>
            <DepositCurrencySelector
                fieldId='exchange-balance-deposit'
                onClick={() => openGlobalModal(chooseTokenDiv)}
                tempTokenSelection={tempTokenSelection}
                setDepositQty={setDepositQty}
            />
            <DepositButton
                onClick={() => {
                    // console.log('clicked');
                    depositFn();
                }}
            />
        </div>
    );
}
