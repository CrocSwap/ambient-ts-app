import styles from './ClaimOrderModalHeader.module.css';
import { VscClose } from 'react-icons/vsc';
import { BsArrowLeft } from 'react-icons/bs';
import { Dispatch, SetStateAction } from 'react';
// import { RiListSettingsLine } from 'react-icons/ri';
interface ClaimOrderModalHeaderPropsIF {
    title: string;
    onClose: () => void;
    // eslint-disable-next-line
    onGoBack?: any;

    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
}
export default function ClaimOrderModalHeader(props: ClaimOrderModalHeaderPropsIF) {
    const goBackButton = (
        <div onClick={props.onGoBack}>
            <BsArrowLeft size={22} />
        </div>
    );

    // const settingsIcon = (
    //     <div
    //         onClick={() => props.setShowSettings(!props.showSettings)}
    //         className={styles.settings_icon}
    //     >
    //         {props.showSettings ? null : <RiListSettingsLine size={18} />}
    //     </div>
    // );
    return (
        <header className={styles.header_container}>
            {props.onGoBack ? goBackButton : <div />}
            <h2>{props.title}</h2>

            <div className={styles.align_center}>
                {/* {settingsIcon} */}
                <div onClick={props.onClose}>
                    <VscClose size={22} />
                </div>
            </div>
        </header>
    );
}
