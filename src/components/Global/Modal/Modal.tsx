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

    // @Junior  I took out your space immediately after <RiCloseFill/>, please
    // @Junior  ... use CSS spacing rules to accomplish spacing needs

    const headerJSX = (
        <header id='modal-header' className={styles.modal_header}>
            <h2 id='modal-title' className={styles.modal_title}>
                {title}
            </h2>
            <span onClick={onClose} className={styles.close_button}>
                <RiCloseFill size={27} />
            </span>
        </header>
    );

    const headerOrNull = noHeader ? null : headerJSX;

    const footerJSX = (
        <footer id='modal-footer' className={styles.modal_footer}>
            {footer}
        </footer>
    );

    const footerOrNull = !footer ? null : footerJSX;

    return (
        <div id='outside-modal' className={styles.outside_modal} onClick={onClose}>
            <div
                id='modal-body'
                className={`
                    ${styles.modal_body}
                    ${noBackground ? styles.no_background_modal : null}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {headerOrNull}
                <section id='modal-content' className={styles.modal_content}>
                    {content}
                </section>
                {footerOrNull}
            </div>
        </div>
    );
}
