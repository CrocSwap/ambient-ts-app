/* eslint-disable @typescript-eslint/no-explicit-any  */
/* eslint-disable @typescript-eslint/no-unused-vars  */

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TutorialHelpModal.module.css';
import { AuctionHelpModal } from './TutorialHelpModalContents';

interface propsIF {
    page: string;
    positiveBtnAction: () => void;
    negativeBtnAction: () => void;
    title?: string;
}

function TutorialHelpModal(props: propsIF) {
    const getModalContent = () => {
        switch (props.page) {
            case 'auction':
                return <AuctionHelpModal />;
            default:
                return <></>;
        }
    };

    return (
        <div className={styles.tuto_help_modal_overlay}>
            <div className={styles.tuto_help_modal_body}>
                <div className={styles.tuto_help_modal_header}>
                    {props.title || 'WHAT IS THIS?'}
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
