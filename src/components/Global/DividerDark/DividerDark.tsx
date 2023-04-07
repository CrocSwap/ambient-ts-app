import styles from './DividerDark.module.css';

interface DividerDarkProps {
    addMarginTop?: boolean;
    addMarginBottom?: boolean;
    changeColor?: boolean;
    // eslint-disable-next-line
    style?: any;
}
export default function DividerDark(props: DividerDarkProps) {
    //  Future Engineer: This is Junior not wanting to refactor the structure of his component so he decided to make a different styling through margin props. You should never have to do something like this. -Jr
    const margin1Style = props.addMarginTop ? styles.add_margin_top : '';
    const margin2Style = props.addMarginBottom ? styles.add_margin_bottom : '';
    const colorStyle = props.changeColor ? styles.change_color : '';
    return (
        <div
            tabIndex={-1}
            className={`${styles.divider_container} ${margin1Style} ${margin2Style} ${colorStyle}`}
        >
            <div className={styles.divider}></div>
        </div>
    );
}
