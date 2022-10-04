import styles from './RemoveOrderModalHeader.module.css';
import { VscClose } from 'react-icons/vsc';
interface RemoveOrderModalHeaderPropsIF {
    title: string;
    onClose: () => void;
}
export default function RemoveOrderModalHeader(props: RemoveOrderModalHeaderPropsIF) {
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
