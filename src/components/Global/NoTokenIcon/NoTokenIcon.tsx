import styles from './NoTokenIcon.module.css';

interface propsIF {
    tokenInitial: string | null;
    width?: string;
    isFutaList?: boolean;
}
export default function NoTokenIcon(props: propsIF) {
    const { tokenInitial, width, isFutaList } = props;

    const widthStyle = width ? width : '30px';
    return (
        <div
            className={styles.no_token_icon}
            style={{
                width: widthStyle,
                height: widthStyle,
                textTransform: 'none',
            }}
        >
            {isFutaList ? (
                <div className={styles.sub_container}>
                    <p>
                        <sub>f</sub>
                        {tokenInitial ?? ''}
                    </p>
                </div>
            ) : (
                <div className={styles.sub_container}>
                    <sub>f</sub>
                    <p>{tokenInitial ?? ''}</p>
                </div>
            )}
        </div>
    );
}
