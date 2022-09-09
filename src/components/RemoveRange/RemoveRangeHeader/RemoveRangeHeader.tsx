import styles from './RemoveRangeHeader.module.css';
import { BiArrowBack } from 'react-icons/bi';

import { VscClose } from 'react-icons/vsc';
interface RemoveRangeHeaderPropsIF {
    title: string;
    onClose: () => void;
}
export default function RemoveRangeHeader(props: RemoveRangeHeaderPropsIF) {
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
