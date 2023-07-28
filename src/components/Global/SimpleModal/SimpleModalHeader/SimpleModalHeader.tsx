import styles from './SimpleModalHeader.module.css';
import { VscClose } from 'react-icons/vsc';
import { BiArrowBack } from 'react-icons/bi';
import { useContext } from 'react';
import { AppStateContext } from '../../../../contexts/AppStateContext';
interface SimpleModalHeaderPropsIF {
    title: string;
    onClose?: () => void;
    onBackButton?: () => void;
    showBackButton?: boolean;
}
export default function SimpleModalHeader(props: SimpleModalHeaderPropsIF) {
    const {
        globalModal: { close: onClose },
    } = useContext(AppStateContext);

    return (
        <header className={styles.header_container}>
            {props.showBackButton && (
                <div className={styles.back_button}>
                    <BiArrowBack
                        size={22}
                        onClick={() =>
                            props.onBackButton && props.onBackButton()
                        }
                        role='button'
                        tabIndex={0}
                        aria-label='Go back button'
                    />
                </div>
            )}
            <h2>{props.title}</h2>
            <div className={styles.close_button}>
                <VscClose
                    size={22}
                    onClick={props.onClose ? props.onClose : onClose}
                    role='button'
                    aria-label='Close modal button'
                    id='close_simple_modal_button'
                />
            </div>
        </header>
    );
}
