import styles from './RemoveOrderModalHeader.module.css';
import { VscClose } from 'react-icons/vsc';
import { BsArrowLeft } from 'react-icons/bs';

interface RemoveOrderModalHeaderPropsIF {
    title: string;
    onClose: () => void;
    // eslint-disable-next-line
    onGoBack?: () => void | any;
}
export default function RemoveOrderModalHeader(props: RemoveOrderModalHeaderPropsIF) {
    return (
        <header className={styles.header_container}>
            {props.onGoBack && (
                <div onClick={props.onGoBack}>
                    <BsArrowLeft size={22} />
                </div>
            )}
            <h2>{props.title}</h2>
            <div onClick={props.onClose}>
                <VscClose size={22} />
            </div>
        </header>
    );
}
