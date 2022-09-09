import styles from './HarvestPositionHeader.module.css';
import { BiArrowBack } from 'react-icons/bi';

import { VscClose } from 'react-icons/vsc';
interface HarvestPositionHeaderPropsIF {
    title: string;
    onClose: () => void;
    onBackButton: () => void;
    showBackButton: boolean;
}
export default function HarvestPositionHeader(props: HarvestPositionHeaderPropsIF) {
    return (
        <header className={styles.header_container}>
            {props.showBackButton ? (
                <div onClick={() => props.onBackButton()}>
                    <BiArrowBack size={22} />
                </div>
            ) : (
                <div />
            )}
            <h2>{props.title}</h2>
            <div onClick={props.onClose}>
                <VscClose size={22} />
            </div>
        </header>
    );
}
