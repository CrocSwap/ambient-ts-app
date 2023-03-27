import styles from './SimpleModalHeader.module.css';
import { VscClose } from 'react-icons/vsc';
interface SimpleModalHeaderPropsIF {
    title: string;
    onClose: () => void;
}
export default function SimpleModalHeader(props: SimpleModalHeaderPropsIF) {
    return (
        <header className={styles.header_container}>
            <div></div>
            <h2>{props.title}</h2>
            <VscClose
                size={22}
                onClick={props.onClose}
                role='button'
                tabIndex={0}
                aria-label='Close modal button'
                id='close_simple_modal_button'
            />
        </header>
    );
}
