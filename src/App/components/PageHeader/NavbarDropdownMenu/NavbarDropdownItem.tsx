import { ReactNode } from 'react';
import {
    MenuItem,
    IconRight,
    ConnectButton,
} from '../../../../styled/Components/Header';

interface propsIF {
    onClick: () => void;
    children: ReactNode;
    rightIcon?: ReactNode;
    connectButton?: boolean;
}

export default function NavbarDropdownItem(props: propsIF) {
    const innerHtml = (
        <>
            <span>{props.children}</span>
            <IconRight>{props.rightIcon}</IconRight>
        </>
    );
    if (props.connectButton) {
        return (
            <ConnectButton
                onClick={() => props.onClick()}
                tabIndex={0}
                role='button'
            >
                {innerHtml}
            </ConnectButton>
        );
    }

    return (
        <MenuItem
            alignItems='center'
            rounded
            color='text1'
            fontSize='header2'
            onClick={() => props.onClick()}
            tabIndex={0}
            role='button'
            fullWidth
        >
            {innerHtml}
        </MenuItem>
    );
}
