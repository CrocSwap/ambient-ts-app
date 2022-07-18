import { motion } from 'framer-motion';
import styles from './CustomTokens.module.css';
import Divider from '../Divider/Divider';
import { useCustomToken } from './useCustomToken';

interface CustomTokenPropsIF {
    chainId: string
}

export default function CustomTokens(props: CustomTokenPropsIF) {
    const { chainId } = props;

    const [setSearchInput, errorText] = useCustomToken(chainId);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={styles.search_input}
        >
            <input type='text' placeholder='0x000' onChange={(e) => setSearchInput(e.target.value.trim().toLowerCase())} />
            <p className={styles.query_error_text}>{errorText}</p>
            <Divider />
            <div className={styles.custom_tokens_header}>
                <span>0 Custom Tokens</span>
                <span className={styles.clear_all_button}>Clear all</span>
            </div>
            <div className={styles.custom_tokens_footer}>
                Tip: Custom tokens are stored locally in your browser
            </div>
        </motion.div>
    );
}