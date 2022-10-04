import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import styles from './Withdraw.module.css';
import WithdrawButton from './WithdrawButton/WithdrawButton';
import WithdrawCurrencySelector from './WithdrawCurrencySelector/WithdrawCurrencySelector';
import { defaultTokens } from '../../../../utils/data/defaultTokens';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setToken } from '../../../../utils/state/temp';
import { useState } from 'react';

interface PortfolioWithdrawProps {
    crocEnv: CrocEnv | undefined;
    connectedAccount: string;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    tempTokenSelection: TokenIF;
}

export default function Withdraw(props: PortfolioWithdrawProps) {
    const { crocEnv, connectedAccount, openGlobalModal, closeGlobalModal, tempTokenSelection } =
        props;

    const dispatch = useAppDispatch();

    const [withdrawQty, setWithdrawQty] = useState<number | undefined>();

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

    const withdrawFn = () => {
        if (crocEnv && withdrawQty) {
            crocEnv.token(tempTokenSelection.address).withdraw(withdrawQty, connectedAccount);
            // crocEnv.token(tempTokenSelection.address).deposit(1, wallet.address);
        }
    };

    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text}>Withdraw tokens from the exchange to your wallet</div>
            <WithdrawCurrencySelector
                fieldId='exchange-balance-withdraw'
                onClick={() => openGlobalModal(chooseTokenDiv)}
                tempTokenSelection={tempTokenSelection}
                setWithdrawQty={setWithdrawQty}
            />
            <WithdrawButton
                onClick={() => {
                    // console.log('clicked');
                    withdrawFn();
                }}
            />
        </div>
    );
}
