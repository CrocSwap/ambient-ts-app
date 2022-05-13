import styles from './Modal.module.css';
import { RiCloseFill } from 'react-icons/ri';

interface ModalProps {
    content: React.ReactNode;
    onClose: React.MouseEventHandler<HTMLElement>;
    title: string;
    actionButton: React.ReactNode;
    noHeader: boolean;
    noBackground: boolean;
}

export default function Modal(props: ModalProps) {
    // THE ONCLOSE FUNCTION IS COMING FROM WHEREVER WE ARE CALLING THE MODAL FROM

    // THIS ALLOWS THE USER TO CLOSE MODAL BY HITTING THE ESCAPE KEY

    //    function closeOnEscapeKeyDown(e: React.KeyboardEvent<Element>) {
    //     if ((e.charCode || e.keyCode) === 27) onClose();
    //   }

    //   const closeOnEscapeKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    //     if ((event.charCode || event.keyCode) === 27) onClose();
    //   };

    //   useEffect(() => {
    //     document.body.addEventListener('keydown', closeOnEscapeKeyDown);
    //     return function cleanUp() {
    //       document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
    //     };
    //   });
    const { onClose, title, content, actionButton, noHeader, noBackground } = props;

    // THIS IS THE MODAL THAT WILL BE SHOWING UP(CHANGE MODAL CONTENTS AND CLASSNAMES HERE)
    const modal = (
        <div className={styles.outside_modal} onClick={onClose}>
            <div
                className={`${styles.modal} ${noBackground ? styles.no_background_modal : null}`}
                onClick={(e) => e.stopPropagation()}
            >
                {!noHeader && (
                    <header className={styles.modal_header}>
                        <div>{''}</div>
                        <h2>{title}</h2>
                        <span onClick={onClose} className={styles.close_button}>
                            <RiCloseFill size={27} />{' '}
                        </span>
                    </header>
                )}

                <section className={`${styles.modal_content} `}>
                    <h1> {content} </h1>
                </section>
                <footer className={styles.modal_footer}>
                    <h3>{actionButton}</h3>
                </footer>
            </div>
        </div>
    );

    return <>{modal}</>;
}
