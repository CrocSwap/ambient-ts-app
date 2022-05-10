import styles from './PageFooter.module.css';
import { RiTable2, RiTwitchFill } from 'react-icons/ri';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { BsMedium } from 'react-icons/bs';

export default function PageFooter() {
    return (
        <footer data-testid={'page-footer'}>
            <h1>This is the Page Footer!</h1>
        </footer>
    );
}
