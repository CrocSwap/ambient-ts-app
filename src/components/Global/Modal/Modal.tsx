import styles from './Modal.module.css';
import { RiCloseFill } from 'react-icons/ri';

interface ModalProps {
    content: React.ReactNode;
    onClose: React.MouseEventHandler<HTMLElement | SVGElement>;
    title: string;
    footer?: React.ReactNode;
    noHeader?: boolean;
    noBackground?: boolean;
}

export default function Modal(props: ModalProps) {
    const { onClose, title, content, footer, noHeader, noBackground } = props;

    // @Junior  I took out your space immediately after <RiCloseFill/>, please
    // @Junior  ... use CSS spacing rules to accomplish spacing needs

    // @Junior  use one variable to hold the JSX element and then another to
    // @Junior  ... insert it or `null` into the DOM via a ternary

    // JSX for the header element
    const headerJSX = (
        <header className={styles.modal_header}>
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

    // @Junior  if possible I'd like to get rid of having two classnames for
    // @Junior  ... the modal body, and accomplish differential styling with
    // @Junior  ... CSS custom propertyies (ie CSS variables)

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
                <section className={styles.modal_content}>{content}</section>
                {footerOrNull}
            </div>
        </div>
    );
}
