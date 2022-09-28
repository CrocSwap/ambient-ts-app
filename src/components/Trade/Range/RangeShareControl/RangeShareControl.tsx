import styles from './RangeShareControl.module.css';
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

    console.log(option);

    return (
        <li className={styles.custom_control}>
            <input
                id={`customCheck1-control-${option.slug}`}
                className={`${styles.ckb} ${styles.ckb_primary}`}
                type='checkbox'
                checked={option.checked}
                onChange={() => handleShareOptionChange(option.slug)}
            />
            <label htmlFor={`customCheck1-${option.slug}`}>{option.name}</label>
        </li>
    );
}
