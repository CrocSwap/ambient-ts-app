import styles from './Spinner.module.css';

interface SpinnerPropsIF {
    size: number | string;
    bg: string;
    weight?: number | string;
    centered?: boolean;
}
// size is a required property that can be either a number or a string.
// bg is an optional property that represents the background gradient string. It can be a string or undefined.
// weight is an optional property that represents the weight of the spinner's border. It can be a number or a string, or undefined.

export default function Spinner(props: SpinnerPropsIF) {
    const width = `${props.size}px`;
    const bg = props.bg ? props.bg : 'var(--body-bg)';
    const weight = props.weight ? `${props.weight}px` : '3px';

    return (
        <div className={props.centered ? styles.container : ''}>
            <div
                className={styles.loader}
                style={{ width: width, height: width }}
            >
                <div
                    className={styles.background}
                    style={{
                        background: bg,
                        top: weight,
                        bottom: weight,
                        left: weight,
                        right: weight,
                    }}
                />
                <div
                    className={styles.overlay}
                    style={{
                        top: weight,
                        bottom: weight,
                        left: weight,
                        right: weight,
                    }}
                />
            </div>
        </div>
    );
}
