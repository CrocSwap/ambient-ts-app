import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { GLOBAL_MODAL_PORTAL_ID } from '../constants';

interface propsIF {
    children: ReactNode;
}

export default function GlobalModalPortal(props: propsIF) {
    const { children } = props;

    const getGlobalModalPortal = (elem: ReactNode) => {
        return createPortal(
            <div onClick={(e) => e.stopPropagation()}>{elem}</div>,
            document.getElementById(GLOBAL_MODAL_PORTAL_ID) ?? document.body,
        );
    };

    return getGlobalModalPortal(children);
}
