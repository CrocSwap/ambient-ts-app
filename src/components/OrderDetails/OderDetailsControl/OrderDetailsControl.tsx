import styles from './OrderDetailsControl.module.css';
import { motion } from 'framer-motion';
type ItemIF = {
    slug: string;
    name: string;
    checked: boolean;
};
interface OrderDetailControlPropsIF {
    item: ItemIF;
    handleChange: (slug: string) => void;
}
export default function OrderDetailsControl(props: OrderDetailControlPropsIF) {
    const { item, handleChange } = props;

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.custom_control}
        >
            <input
                id={`customCheck1-${item.slug}`}
                className={`${styles.ckb} ${styles.ckb_primary}`}
                type='checkbox'
                checked={item.checked}
                onChange={() => handleChange(item.slug)}
            />
            <label htmlFor={`customCheck1-${item.slug}`}>{item.name}</label>
        </motion.div>
    );
}
