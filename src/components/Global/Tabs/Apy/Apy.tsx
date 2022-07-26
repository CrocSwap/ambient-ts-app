import { Styles } from '@material-ui/core/styles/withStyles';
import styles from './Apy.module.css';

interface ApyProps {
    amount: number;
}

export default function Apy(props: ApyProps) {
    const { amount } = props;

    const apyColor = amount > 20 ? styles.apy_green : styles.apy_red;
    return (
        <section className={`${styles.apy} ${apyColor}`}>
            <p>{amount}</p>
        </section>
    );
}
