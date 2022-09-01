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

    const newCheckBox = (
        <div className={styles.checkboxes}>
            <input
                id='ckb0'
                className={`${styles.ckb} ${styles.ckb_primary}`}
                type='checkbox'
                checked
            />
            <label htmlFor='ckb0'>Checkbox</label>
        </div>
    );

    return (
        <div className={styles.custom_control}>
            {/* <input
                type='checkbox'
                className={styles.custom_control_input}
                id={`customCheck1-${item.slug}`}
                checked={item.checked}
                onChange={() => handleChange(item.slug)}
            />
            <label className={styles.custom_control_label} htmlFor={`customCheck1-${item.slug}`}>
                {item.name}
            </label> */}

            <input
                id={`customCheck1-${item.slug}`}
                className={`${styles.ckb} ${styles.ckb_primary}`}
                type='checkbox'
                checked={item.checked}
                onChange={() => handleChange(item.slug)}
            />
            <label htmlFor={`customCheck1-${item.slug}`}>{item.name}</label>
        </div>
    );
}
