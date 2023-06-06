import { useEffect, ReactNode } from 'react';
import useKeyPress from '../../../App/hooks/useKeyPress';
import styles from './RelativeModal.module.css';

interface RelativeModalProps {
    onClose: () => void;
    noHeader?: boolean;
    noBackground?: boolean;
    children: ReactNode;
}

export default function RelativeModal(props: RelativeModalProps) {
    const { onClose, noHeader, noBackground, children } = props;

    const isEscapePressed = useKeyPress('Escape');
    useEffect(() => {
        if (isEscapePressed) {
            onClose();
        }
    }, [isEscapePressed]);

    // variables to hold both the header or footer JSX elements vs `null`
    // ... both elements are optional and either or both may be absent
    // ... from any given modal, this allows the element to render `null`
    // ... if the element is not being used in a particular instance
    // const headerOrNull = noHeader ? null : headerJSX;
    const headerOrNull = noHeader ? null : null;

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
                <section className={styles.modal_content}>
                    <img
                        src='https://100dayscss.com/codepen/alert.png'
                        width='44'
                        height='38'
                    />
                    {children}
                </section>
                <button className={styles.footer_button} onClick={onClose}>
                    Dismiss
                </button>
            </div>
        </div>
    );
}
