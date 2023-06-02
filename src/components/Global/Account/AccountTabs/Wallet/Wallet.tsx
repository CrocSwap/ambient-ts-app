import styles from './Wallet.module.css';
import WalletCard from './WalletCard';
import WalletHeader from './WalletHeader';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { tokenMethodsIF } from '../../../../../App/hooks/useTokens';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import Spinner from '../../../Spinner/Spinner';

interface propsIF {
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    connectedAccountActive: boolean;
    tokens: tokenMethodsIF;
}

export default function Wallet(props: propsIF) {
    const { connectedAccountActive, resolvedAddressTokens, tokens } = props;

    const { nativeToken, erc20Tokens } = useAppSelector(
        (state) => state.userData.tokens,
    );
    const connectedUserTokens = [nativeToken]
        .concat(erc20Tokens)
        .filter((token) => token);

    const userTokens = connectedAccountActive
        ? connectedUserTokens
        : resolvedAddressTokens;

    // TODO:   @Junior  I don't think there's any reason for the header element in
    // TODO:   ... the return statement to be abstracted into its own file as it
    // TODO:   ... appears to be fully static, please code it locally in this file
    // TODO:   ... and make sure that it is a <header> semantic element  --Emily

    return (
        <div
            className={styles.container}
            style={{ height: 'calc(100vh - 19.5rem' }}
        >
            <WalletHeader />
            <div className={styles.item_container}>
                {userTokens && userTokens.length > 0 ? (
                    userTokens.map((token) => (
                        <WalletCard
                            key={JSON.stringify(token)}
                            token={token}
                            tokens={tokens}
                        />
                    ))
                ) : (
                    <Spinner size={100} bg='var(--dark1)' centered />
                )}
            </div>
        </div>
    );
}
