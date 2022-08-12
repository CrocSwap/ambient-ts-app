import styles from './ChatPanel.module.css';
import { motion } from 'framer-motion';

interface ChatProps {
    chatStatus: boolean;
}

export default function ChatPanel(props: ChatProps) {
    return (
        <>
            {props.chatStatus ? (
                //  <div className={styles.outside_modal}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className={`
                            ${styles.modal_body}
                        `}
                    onClick={(e) => e.stopPropagation()}
                >
                    <section className={styles.modal_content}>sdsd</section>
                </motion.div>
            ) : (
                // </div>
                <></>
            )}
        </>
    );
}
