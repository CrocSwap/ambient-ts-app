import { Link } from 'react-router-dom';
import NotFound from '../../../assets/animations/NotFound.json';
import Animation from '../../Global/Animation/Animation';
import styles from './NotFoundLottie.module.css';

export default function NotFoundLottie() {
    return (
        <div className={styles.notfound_container}>
            <Animation animData={NotFound} loop />
            <div className={styles.content}>
                Click
                <Link to='/'>Here</Link>
                to go back home
            </div>
        </div>
    );
}
