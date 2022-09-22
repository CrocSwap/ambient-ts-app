import styles from './RangeShareControl.module.css';
import { motion } from 'framer-motion';
type OptionIF = {
    slug: string;
    name: string;
    checked: boolean;
};
interface RangeShareControlPropsIF {
    option: OptionIF;
    handleShareOptionChange: (option: string) => void;
}
export default function RangeShareControl(props: RangeShareControlPropsIF) {
    const { option, handleShareOptionChange } = props;

    return (
        <motion.li
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.custom_control}
        >
            <input
                id={`customCheck1-${option.slug}`}
                className={`${styles.ckb} ${styles.ckb_primary}`}
                type='checkbox'
                checked={option.checked}
                onChange={() => handleShareOptionChange(option.slug)}
            />
            <label htmlFor={`customCheck1-${option.slug}`}>{option.name}</label>
        </motion.li>
    );
}
