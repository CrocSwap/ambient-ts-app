import styles from './NoTokenIcon.module.css';

interface NoTokenIconPropsIF {
    tokenInitial: string;
    width?: string;
}
export default function NoTokenIcon(props: NoTokenIconPropsIF) {
    const { tokenInitial, width } = props;

    const widthStyle = width ? width : '30px';

    return (
        <div className={styles.no_token_icon} style={{ width: widthStyle, height: widthStyle }}>
            <p>{tokenInitial}</p>
        </div>
    );
}
