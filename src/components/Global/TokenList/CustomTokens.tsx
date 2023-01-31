import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './CustomTokens.module.css';
import Divider from '../Divider/Divider';
import { useCustomToken } from './useCustomToken';
import { TokenIF } from '../../../utils/interfaces/exports';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../utils/state/tradeDataSlice';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { AiOutlineDelete } from 'react-icons/ai';
import { FiExternalLink } from 'react-icons/fi';

interface propsIF {
    chainId: string;
    tokenToUpdate: string;
    undeletableTokens: string[];
    closeModal: () => void;

    justTokensDisplay?: boolean;
}

export default function CustomTokens(props: propsIF) {
    const { chainId, tokenToUpdate, undeletableTokens, closeModal, justTokensDisplay } = props;

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

    // TODO:  circle back and refactor this function later to navigate with URL params
    // TODO:  ... can't do this until we have Doug's token universe code in place and
    // TODO:  ... and this exists to handle tokens for which we have no internal reference

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
            className={styles.search_container}
        >
            {!justTokensDisplay && (
                <div className={styles.search_input}>
                    <input
                        type='text'
                        placeholder='0x000'
                        onChange={(e) => setSearchInput(e.target.value.trim().toLowerCase())}
                    />
                </div>
            )}

            <p className={styles.query_error_text}>{errorText}</p>

            <div className={styles.token_result_container}>
                {tokenAlreadyImported ||
                    foundTokens.map((token: TokenIF) => (
                        <div key={`found_token_${token.address}`} className={styles.token_result}>
                            <div className={styles.token_info}>
                                <div className={styles.token_icon_key}>
                                    <img src={uriToHttp(token.logoURI)} alt='' width='30px' />
                                    <p className={styles.symbol}>{token.symbol}</p>
                                </div>
                                <h4 className={styles.token_name}>{token.name}</h4>
                            </div>
                            <button onClick={() => importToken(token)}>Import</button>
                        </div>
                    ))}
            </div>

            {!justTokensDisplay && (
                <>
                    <Divider />

                    <div className={styles.custom_tokens_header}>
                        <span>{importedTokens.length} Custom Tokens</span>
                        <span className={styles.clear_all_button}>Clear all</span>
                    </div>
                </>
            )}
            <div className={styles.imported_token_container}>
                {importedTokens.map((token: TokenIF) => (
                    <div key={`imported_token_${token.address}`} className={styles.token_result}>
                        <div className={styles.token_info}>
                            <div className={styles.token_icon_key}>
                                <img src={uriToHttp(token.logoURI)} alt='no image' width='30px' />
                                <p className={styles.symbol}>{token.symbol}</p>
                            </div>
                            <h4 className={styles.token_name}>{token.name}</h4>
                        </div>
                        <div className={styles.action_menu}>
                            {undeletableTokens.includes(token.address) || (
                                <div onClick={() => deleteToken(token)}>
                                    <AiOutlineDelete size={15} />
                                </div>
                            )}
                            <a
                                href={`https://etherscan.io/address/${token?.address}`}
                                target='_blank'
                                rel='noreferrer'
                            >
                                <FiExternalLink size={15} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.custom_tokens_footer}>
                Tip: Custom tokens are stored locally in your browser
            </div>
        </motion.div>
    );
}
