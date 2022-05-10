import styles from './PageFooter.module.css';
import { RiTable2, RiTwitchFill } from 'react-icons/ri';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { BsMedium } from 'react-icons/bs';

export default function PageFooter() {
    return (
        <footer data-testid={'page-footer'} className={styles.footer}>
            <a href='#'>
                <RiTwitchFill color='#fff' size={20} />
                <span>Twitter</span>
            </a>
            <a href='#'>
                <FaDiscord color='#fff' size={20} />
                <span>Discord</span>
            </a>
            <a href='#'>
                <BsMedium color='#fff' size={20} />
                <span>Medium</span>
            </a>
            <a href='#'>
                <FaGithub color='#fff' size={20} />
                <span>Github</span>
            </a>
            <a href='#'>
                <span>Docs</span>
            </a>
        </footer>
    );
}
