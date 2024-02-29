import TokenIcon from '../../../TokenIcon/TokenIcon';
import styles from './Points.module.css';

interface propsIF {
    shortName: string;
    longName: string;
    pointsAccrued: number;
}

export default function PointsRow(props: propsIF) {
    const { shortName, longName, pointsAccrued } = props;
    return (
        <div className={styles.exchange_row}>
            <div className={styles.logo_box}>
                <TokenIcon />
                <p>{shortName}</p>
            </div>
            <p>{longName}</p>
            <p>{pointsAccrued}</p>
        </div>
    );
}
