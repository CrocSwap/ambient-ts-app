import styles from './PageFooter.module.css';
import { RiTwitchFill } from 'react-icons/ri';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { BsMedium } from 'react-icons/bs';

interface IFooterProps {
    lastBlockNumber: number;
}

export default function PageFooter(props: IFooterProps) {
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
            <a href='#'>
                <span>{props.lastBlockNumber}</span>
            </a>
        </footer>
    );
}
