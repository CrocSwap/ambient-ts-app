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
            <div onClick={props.onClose}>
                <VscClose size={22} />
            </div>
        </header>
    );
}
