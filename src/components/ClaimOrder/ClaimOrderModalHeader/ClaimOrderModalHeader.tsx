import styles from './ClaimOrderModalHeader.module.css';
import { VscClose } from 'react-icons/vsc';
import { BiArrowBack } from 'react-icons/bi';
// import { RiListSettingsLine } from 'react-icons/ri';
interface ClaimOrderModalHeaderPropsIF {
    title: string;
    onClose: () => void;
    // eslint-disable-next-line
    onGoBack?: any;

    // showSettings: boolean;
    // setShowSettings: Dispatch<SetStateAction<boolean>>;
}
export default function ClaimOrderModalHeader(
    props: ClaimOrderModalHeaderPropsIF,
) {
    const goBackButton = (
        <BiArrowBack
            size={22}
            onClick={() => props.onGoBack()}
            role='button'
            tabIndex={0}
            aria-label='Go back button'
        />
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
                <VscClose
                    size={22}
                    onClick={props.onClose}
                    role='button'
                    tabIndex={0}
                    aria-label='Close modal button'
                />
            </div>
        </header>
    );
}
