import styles from './NotFound.module.css';
import NotFoundLottie from '../../components/NotFound/NotFoundLottie/NotFoundLottie';
import Game from '../../components/NotFound/Game/Game';
export default function NotFound() {
    return (
        <div className={styles.container}>
            <NotFoundLottie />
            <Game />
        </div>
    );
}
