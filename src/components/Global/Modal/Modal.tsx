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
    // THE ONCLOSE FUNCTION IS COMING FROM WHEREVER WE ARE CALLING THE MODAL FROM

    // THIS ALLOWS THE USER TO CLOSE MODAL BY HITTING THE ESCAPE KEY

    //    function closeOnEscapeKeyDown(e: React.KeyboardEvent<Element>) {
    //     if ((e.charCode || e.keyCode) === 27) onClose();
    //   }

    //   const closeOnEscapeKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    //     if ((event.key) === 'Escape') onClose();
    //       console.log(event)
    //   };

    //   useEffect(() => {
    //     document.body.addEventListener('keydown', closeOnEscapeKeyDown);
    //     return function cleanUp() {
    //       document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
    //     };
    //   });

    // THIS IS THE MODAL THAT WILL BE SHOWING UP(CHANGE MODAL CONTENTS AND CLASSNAMES HERE)
    const headerOrNull = noHeader ? null : (
        <header className={styles.modal_header}>
            <div>{''}</div>
            <h2>{title}</h2>
            <span onClick={onClose} className={styles.close_button}>
                <RiCloseFill size={27} />{' '}
            </span>
        </header>
    );

    const footerOrNull = !footer ? null : <footer className={styles.modal_footer}>{footer}</footer>;

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
