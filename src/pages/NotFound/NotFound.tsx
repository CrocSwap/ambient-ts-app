import styles from './NotFound.module.css';
import NotFoundLottie from '../../components/NotFound/NotFoundLottie';
export default function NotFound() {
    return (
        <div className={styles.row}>
            <NotFoundLottie />
        </div>
    );
}
