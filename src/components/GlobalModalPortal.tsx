import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { GLOBAL_MODAL_PORTAL_ID } from '../constants';

interface propsIF {
    isOpen: boolean;
    children: ReactNode;
}

export default function GlobalModalPortal(props: propsIF) {
    const { isOpen, children } = props;

    const getGlobalModalPortal = (elem: ReactNode) => {
        return createPortal(
            elem,
            document.getElementById(GLOBAL_MODAL_PORTAL_ID) ?? document.body,
        );
    };

    return isOpen ? getGlobalModalPortal(children) : <></>;
}
