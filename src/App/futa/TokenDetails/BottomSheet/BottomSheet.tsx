import styles from './BottomSheet.module.css';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
    isOpen: boolean;
    children: React.ReactNode;
}
export default function BottomSheet(props: BottomSheetProps) {
    const { isOpen, children } = props;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.bottom}
                    initial={{ bottom: '-300px' }}
                    animate={{ bottom: '0px' }}
                    exit={{ bottom: '-300px' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
