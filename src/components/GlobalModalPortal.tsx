import { ReactNode, ReactPortal, useContext } from 'react';
import { createPortal } from 'react-dom';
import { GLOBAL_MODAL_PORTAL_ID } from '../ambient-utils/constants';
import { BrandContext } from '../contexts/BrandContext';

interface propsIF {
    children: ReactNode;
}

export default function GlobalModalPortal(props: propsIF) {
    const { skin } = useContext(BrandContext);
    const { children } = props;

    const getGlobalModalPortal = (elem: ReactNode): ReactPortal => {
        return createPortal(
            <div onClick={(e) => e.stopPropagation()} data-theme={skin.active}>
                {elem}
            </div>,
            document.getElementById(GLOBAL_MODAL_PORTAL_ID) ?? document.body,
        );
    };

    return getGlobalModalPortal(children);
}
