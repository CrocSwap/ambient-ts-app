import styles from './Modal.module.css';
import { RiCloseFill } from 'react-icons/ri';

interface ModalProps {
    content?: React.ReactNode;
    onClose: React.MouseEventHandler<HTMLElement | SVGElement>;
    title: string;
    footer?: React.ReactNode;
    noHeader?: boolean;
    noBackground?: boolean;
    children: React.ReactNode;
}

export default function Modal(props: ModalProps) {
    const { onClose, title, content, footer, noHeader, noBackground, children } = props;

    // TODO: Create functionality to close modal with escape key.

    // JSX for the header element
    const headerJSX = (
        <header className={styles.modal_header}>
            <div />
            <h2 className={styles.modal_title}>{title}</h2>
            <RiCloseFill size={27} className={styles.close_button} onClick={onClose} />
        </header>
    );

    // JSX for the footer element
    const footerJSX = <footer className={styles.modal_footer}>{footer}</footer>;

    // variables to hold both the header or footer JSX elements vs `null`
    // ... both elements are optional and either or both may be absent
    // ... from any given modal, this allows the element to render `null`
    // ... if the element is not being used in a particular instance
    const headerOrNull = noHeader ? null : headerJSX;
    const footerOrNull = !footer ? null : footerJSX;

    return (
        <div className={styles.outside_modal} onClick={onClose}>
            <div
                className={`
                    ${styles.modal_body}
                    ${noBackground ? styles.no_background_modal : null}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {headerOrNull}
                <section className={styles.modal_content}>{children}</section>
                {footerOrNull}
            </div>
        </div>
    );
}
