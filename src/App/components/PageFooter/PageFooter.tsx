import styles from './PageFooter.module.css';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { BsMedium } from 'react-icons/bs';
import { AiFillTwitterCircle } from 'react-icons/ai';

interface IFooterProps {
    lastBlockNumber: number;
}

const pageBlockSign = <div className={styles.page_block_sign}></div>;

export default function PageFooter(props: IFooterProps) {
    return (
        <footer data-testid={'page-footer'} className={styles.footer}>
            <a href='#'>
                <AiFillTwitterCircle size={15} />
                {/* <span>Twitter</span> */}
            </a>
            <a href='#'>
                <FaDiscord size={15} />
                {/* <span>Discord</span> */}
            </a>
            <a href='#'>
                <BsMedium size={15} />
                {/* <span>Medium</span> */}
            </a>
            <a href='#'>
                <FaGithub size={15} />
                {/* <span>Github</span> */}
            </a>
            <a href='#'>
                <span>Docs</span>
            </a>
            <a href='#'>
                {pageBlockSign}
                <span>{props.lastBlockNumber}</span>
            </a>
        </footer>
    );
}
