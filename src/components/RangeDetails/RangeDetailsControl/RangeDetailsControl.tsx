import styles from './RangeDetailsControl.module.css';

type ItemIF = {
    slug: string;
    name: string;
    checked: boolean;
};
interface RangeDetailControlPropsIF {
    item: ItemIF;
    handleChange: (slug: string) => void;
}
export default function RangeDetailsControl(props: RangeDetailControlPropsIF) {
    const { item, handleChange } = props;

    return (
        <div className={`${styles.custom_control} ${styles.custom_checkbox}`}>
            <input
                type='checkbox'
                className={styles.custom_control_input}
                id={`customCheck1-${item.slug}`}
                checked={item.checked}
                onChange={() => handleChange(item.slug)}
            />
            <label className={styles.custom_control_label} htmlFor={`customCheck1-${item.slug}`}>
                {item.name}
            </label>
        </div>
    );
}
