import LevelsCard from '../../components/Global/LevelsCard/LevelsCard';
import styles from './Level.module.css';

export default function Level() {
    return (
        <div className={styles.level_page_container}>
            <LevelsCard />
        </div>
    );
}
