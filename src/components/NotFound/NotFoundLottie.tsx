import styles from './NotFoundLottie.module.css';
import Animation from '../Global/Animation/Animation';
import NotFound from '../../assets/animations/NotFound.json';

export default function NotFoundLottie() {
    return (
        <div className={styles.notfound_container}>
            <Animation animData={NotFound} loop />
            <div className={styles.content}>Click here to go back home</div>
        </div>
    );
}
