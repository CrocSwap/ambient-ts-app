import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './CustomTokens.module.css';
import Divider from '../Divider/Divider';
import { useCustomToken } from './useCustomToken';
import { TokenIF } from '../../../utils/interfaces/exports';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../utils/state/tradeDataSlice';

interface CustomTokenPropsIF {
    chainId: string;
    tokenToUpdate: string;
    closeModal: () => void;
}

export default function CustomTokens(props: CustomTokenPropsIF) {
    const { chainId, tokenToUpdate, closeModal } = props;

    const dispatch = useAppDispatch();

    const [setSearchInput, tokenAlreadyImported, setTokenAlreadyImported, foundTokens, errorText] =
        useCustomToken(chainId);

    const [importedTokens, setImportedTokens] = useState<TokenIF[]>(
        JSON.parse(localStorage.getItem('user') as string).tokens.filter(
            (tkn: TokenIF) => tkn.fromList === 'custom',
        ),
    );

    function deleteToken(sadToken: TokenIF) {
        setTokenAlreadyImported(false);
        setImportedTokens(
            importedTokens.filter(
                (token: TokenIF) =>
                    token.address !== sadToken.address || token.chainId !== sadToken.chainId,
            ),
        );
        const user = JSON.parse(localStorage.getItem('user') as string);
        user.tokens = user.tokens.filter(
            (token: TokenIF) =>
                token.address !== sadToken.address || token.chainId !== sadToken.chainId,
        );
        localStorage.setItem('user', JSON.stringify(user));
    }

    function importToken(newToken: TokenIF) {
        switch (tokenToUpdate) {
            case 'A':
                dispatch(setTokenA(newToken));
                closeModal();
                break;
            case 'B':
                dispatch(setTokenB(newToken));
                closeModal();
                break;
            default:
                console.warn(
                    `Problem in function importToken() in CustomTokens.tsx file. Did not recognize whether to update Token A or Token B in Redux Toolkit.  Received value <<<<<${tokenToUpdate}>>>>> of type <<<<<${typeof tokenToUpdate}>>>>>, recognized values are 'A' and 'B' (type: string). App will not close modal, refer to CustomTokens.tsx for troubleshooting.`,
                );
                break;
        }
        setTokenAlreadyImported(true);
        setImportedTokens([...importedTokens, newToken]);
        const user = JSON.parse(localStorage.getItem('user') as string);
        user.tokens = [...user.tokens, newToken];
        localStorage.setItem('user', JSON.stringify(user));
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={styles.search_input}
        >
            <input
                type='text'
                placeholder='0x000'
                onChange={(e) => setSearchInput(e.target.value.trim().toLowerCase())}
            />
            <p className={styles.query_error_text}>{errorText}</p>
            <Divider />
            <div className={styles.custom_tokens_header}>
                <span>0 Custom Tokens</span>
                <span className={styles.clear_all_button}>Clear all</span>
            </div>
            {importedTokens.map((token: TokenIF) => (
                <div key={`imported_token_${token.address}`}>
                    <h4>{token.name}</h4>
                    <button onClick={() => deleteToken(token)}>Delete</button>
                </div>
            ))}
            {tokenAlreadyImported ||
                foundTokens.map((token: TokenIF) => (
                    <div key={`found_token_${token.address}`}>
                        <h4>{token.name}</h4>
                        <button onClick={() => importToken(token)}>Import</button>
                    </div>
                ))}
            <div className={styles.custom_tokens_footer}>
                Tip: Custom tokens are stored locally in your browser
            </div>
        </motion.div>
    );
}
