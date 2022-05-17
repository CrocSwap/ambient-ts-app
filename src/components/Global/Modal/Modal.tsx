import styles from './Modal.module.css';
import { RiCloseFill } from 'react-icons/ri';

interface ModalProps {
    content: React.ReactNode;
    onClose: React.MouseEventHandler<HTMLElement>;
    title: string;
    footer?: React.ReactNode;
    noHeader?: boolean;

    noBackground?: boolean;
}

export default function Modal(props: ModalProps) {
    const { onClose, title, content, footer, noHeader, noBackground } = props;

    const headerJSX = (
        <header className={styles.modal_header}>
            <div>{''}</div>
            <h2>{title}</h2>
            <span onClick={onClose} className={styles.close_button}>
                <RiCloseFill size={27} />{' '}
            </span>
        </header>
    );

    const headerOrNull = noHeader ? null : headerJSX;

    const footerJSX = <footer className={styles.modal_footer}>{footer}</footer>;

    const footerOrNull = !footer ? null : footerJSX;

    const modal = (
        <div className={styles.outside_modal} onClick={onClose}>
            <div
                className={`${styles.modal} ${noBackground ? styles.no_background_modal : null}`}
                onClick={(e) => e.stopPropagation()}
            >
                {headerOrNull}
                <section className={`${styles.modal_content} `}>{content}</section>
                {footerOrNull}
            </div>
        </div>
    );

    return <>{modal}</>;
}
