import { memo, useContext } from 'react';
import styles from './TutorialHelpModal.module.css';
import {
    AuctionHelpModal,
    DefaultHelpModalAmbient,
    DefaultHelpModalFuta,
} from './TutorialHelpModalContents';
import { BrandContext } from '../../../../contexts/BrandContext';

interface propsIF {
    page: string;
    positiveBtnAction: () => void;
    negativeBtnAction: () => void;
    title?: string;
}

function TutorialHelpModal(props: propsIF) {
    const { platformName } = useContext(BrandContext);

    const getModalContent = () => {
        switch (props.page) {
            case 'auctions':
                return <AuctionHelpModal />;
            default:
                return platformName === 'ambient' ? (
                    <DefaultHelpModalAmbient />
                ) : (
                    <DefaultHelpModalFuta />
                );
        }
    };

    return (
        <div
            className={styles.tuto_help_modal_overlay}
            onClick={props.negativeBtnAction}
        >
            <div
                className={`${styles.tuto_help_modal_body} ${platformName === 'ambient' ? styles.ambi : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.tuto_help_modal_header}>
                    {props.title || 'WHAT IS THIS?'}
                    <div
                        className={styles.tuto_help_modal_dismiss}
                        onClick={props.negativeBtnAction}
                    >
                        X
                    </div>
                </div>

                <div className={styles.tuto_help_modal_content}>
                    {getModalContent()}
                </div>
                <div className={styles.tuto_help_modal_footer}>
                    <div
                        className={
                            styles.help_modal_btn + ' ' + styles.secondary
                        }
                        onClick={props.negativeBtnAction}
                    >
                        Cancel
                    </div>
                    <div
                        className={styles.help_modal_btn}
                        onClick={props.positiveBtnAction}
                    >
                        Show Tutorial
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(TutorialHelpModal);
