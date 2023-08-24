import styles from './ModalHeader.module.css';
import { VscClose } from 'react-icons/vsc';
import { BiArrowBack } from 'react-icons/bi';

interface SimpleModalHeaderPropsIF {
    title: string;
    onClose?: () => void;
    onBackButton?: () => void;
    showBackButton?: boolean;
}
export default function ModalHeader(props: SimpleModalHeaderPropsIF) {
    const {
        title,
        onClose = () => null,
        onBackButton = () => null,
        showBackButton = false,
    } = props;

    return (
        <header className={styles.header_container}>
            {showBackButton ? (
                <BiArrowBack
                    size={22}
                    onClick={onBackButton}
                    role='button'
                    tabIndex={0}
                    aria-label='Go back button'
                />
            ) : (
                <div />
            )}
            <h2>{title}</h2>
            <VscClose
                size={22}
                onClick={onClose}
                role='button'
                aria-label='Close modal button'
                id='close_simple_modal_button'
            />
        </header>
    );
}
