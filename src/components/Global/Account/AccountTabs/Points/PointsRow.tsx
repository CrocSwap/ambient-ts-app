import TokenIcon from '../../../TokenIcon/TokenIcon';
import styles from './Points.module.css';

interface propsIF {
    shortName: string;
    longName: string;
    pointsAccrued: string | number;
    logo?: JSX.Element;
}

export default function PointsRow(props: propsIF) {
    const { shortName, longName, pointsAccrued, logo } = props;
    return (
        <div className={styles.exchange_row}>
            <div className={styles.logo_box}>
                {logo ? logo : <TokenIcon />}
                <p>{shortName}</p>
            </div>
            <p>{longName}</p>
            <p>{pointsAccrued}</p>
        </div>
    );
}
