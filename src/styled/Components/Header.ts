import { Link, NavLink } from 'react-router-dom';

import styled, { css } from 'styled-components/macro';
import { motion } from 'framer-motion';

import { FlexContainer, GridContainer } from '../Common';


interface LevelButtonProps {
    large?: boolean;
}







export enum HeaderClasses {
    active = 'active',
    inactive = 'inactive',
}

const NavigationLinkStyles = css`
    text-decoration: none;
    position: relative;
    padding-bottom: 0.2rem;
    font-family: var(--font-family);
    font-weight: 300;
    font-size: var(--header2-size);
    line-height: var(--header2-lh);
    letter-spacing: -0.02em;
    color: var(--text2);

    &.active,
    &:hover,
    &.active:focus-visible,
    &:focus-visible {
        color: var(--text1);
        transition: opacity var(--animation-speed) ease-in-out;
        outline: 1px solid transparent;
    }

    &.active:focus-visible,
    &:focus-visible {
        border: var(--grey-light-border);
    }

    &:hover:after,
    &:focus-visible:after {
        opacity: 1;
    }
`;

interface NavigationLinkProps {
    className: HeaderClasses.active | HeaderClasses.inactive;
}

export const NavigationLink = styled(Link)<NavigationLinkProps>`
    ${NavigationLinkStyles}
`;

interface NavigationLinkProps {
    className: HeaderClasses.active | HeaderClasses.inactive;
}


// WalletDropdown

export const WalletDisplay = styled(FlexContainer)`
    p {
        font-size: var(--body-size);
        line-height: var(--body-lh);
        color: var(--text2);
    }
`;

export const NameDisplay = styled(FlexContainer)`
    h2 {
        font-size: var(--header2-size);
        line-height: var(--header2-lh);
        color: var(--text1);
        font-weight: 100;
    }
`;

export const CopyButton = styled.button`
    cursor: pointer;
    background: transparent;
    border: none;
`;

export const TokenContainer = styled.section`
    font-size: var(--header2-size);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 4px 10px;

    &:not(:last-of-type) {
        border-bottom: 1px solid var(--dark1);
    }
`;

export const LogoName = styled(FlexContainer)`
    img {
        width: 25px;
        height: 25px;
    }
`;

export const TokenAmount = styled(FlexContainer)`
    h3 {
        color: var(--text1);
        text-align: right;
    }

    h3,
    h6 {
        text-align: right;
    }
`;

export const NameDisplayContainer = styled(FlexContainer)`
    margin: 0 auto;
    overflow: visible;
    .image {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--title-gradient);
    }
`;

export const ActionsContainer = styled(GridContainer)`
    bottom: 0;
    z-index: 9;

    a:hover,
    a:focus-visible {
        color: var(--text-grey-white);
    }
`;

export const AccountLink = styled(NavLink)`
    cursor: pointer;
    border: none;
    outline: none;
    padding: 6px 8px;
    display: flex;
    justify-content: center;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    border-radius: var(--border-radius);

    background: var(--dark3);
    text-decoration: none;
    color: var(--text2);
`;

export const WalletContent = styled.section`
    background: var(--dark3);
    padding: 8px 1rem;
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    height: 200px;
    overflow-y: hidden;
    &::-webkit-scrollbar {
        display: none;
    }
`;

export const WalletWrapper = styled(FlexContainer)`
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0px 45px 30px rgba(0, 0, 0, 0.5);
    background: var(--dark2);
    position: absolute;
    top: 50px;
    width: 347px;
    height: 280px;
    right: 0px;
    z-index: 9999;
    padding: 8px 1rem;
    opacity: 1;
    bottom: 85px;
    pointer-events: auto;
    border: 1px solid var(--accent1);
    @media (max-width: 500px) {
        width: 300px;
        right: -100px;
    }
`;

export const LevelWrapper = styled(FlexContainer)`
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0px 45px 30px rgba(0, 0, 0, 0.5);
    background: var(--dark2);
    position: absolute;
    top: 50px;
    width: auto;
    min-width: 350px;
    right: 15px;
    z-index: 9999;
    padding: 8px 1rem;
    border: 1px solid var(--accent1);

    opacity: 1;
    bottom: 85px;
    pointer-events: auto;

    display: flex;
    flex-direction: column;
    height: 150px;
    gap: 8px;
    border-radius: 4px;

    @media (max-width: 500px) {
        right: -50px;
        width: 300px;
    }
`;
export const AccountDropdownWrapper = styled(FlexContainer)`
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0px 45px 30px rgba(0, 0, 0, 0.5);
    background: var(--dark2);
    position: absolute;
    top: 30px;
    width: 147px;
    right: 0px;
    z-index: 9999;
    padding: 8px 1rem;

    opacity: 1;
    bottom: 85px;
    pointer-events: auto;
    border: 1px solid var(--accent1);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    height: 136px;
    gap: 8px;
`;

// Account

export const TitleGradientButton = styled.button`
    outline: none;
    border: none;
    background: var(--dark2);
    padding: 7.5px 12px 7.5px 6px;
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    cursor: pointer;

    &:hover,
    &:focus-visible {
        box-shadow: var(--glow-light-box-shadow);
    }

    p {
        background: var(--title-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: var(--body-size);
        line-height: var(--body-lh);
    }
`;

export const LevelButton = styled.button<LevelButtonProps>`
    outline: none;
    border: none;
    background: var(--accent1);
    width: ${(props) => (props.large ? '40px' : '30px')};
    height: ${(props) => (props.large ? '40px' : '30px')};
    border-radius: 50%;
    padding: 4px 3px 4px 4px;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    font-size: var(--body-size);
    line-height: var(--body-lh);
    color: var(--text1);
`;
export const WalletName = styled.p`
    min-width: 80px;

    @media (max-width: 600px) {
        display: none;
    }
`;

// ExchangeBalanceDropdown

export const StyledExchangeBalanceDropdown = styled.div`
    position: absolute;
    top: 68px;
    right: 5px;
    height: 510px;
    border: none;
    overflow: hidden;
    transition: all var(--animation-speed) ease;
    z-index: 999;
    background: var(--dark1);
    border-radius: var(--border-radius);
    box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.25);
    text-align: start;
    border: 1px solid var(--accent1);

    @media only screen and (max-width: 600px) {
        width: auto;
        height: auto;
        background: transparent;
        border-radius: var(--border-radius);
    }
`;

// NavbarDropdownMenu

export const NavbarDropdown = styled.div<{ hasBorder?: boolean }>`
    position: absolute;
    top: 60px;
    width: 240px;
    height: auto;
    transform: translateX(-45%);
    border: none;
    padding: 1rem;
    overflow: hidden;
    transition: all var(--animation-speed) ease;
    background: var(--dark2);
    border-radius: var(--border-radius);
    box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.25);
    z-index: 999;

    ${(props) =>
        props.hasBorder &&
        css`
            border: 1px solid var(--accent1);
        `}
`;

export const Menu = styled(motion.div)`
    width: 100%;
    z-index: 999;
    outline: none;
    border: none;
    background: transparent;
`;

export const MenuItem = styled(FlexContainer)`
    height: 50px;
    padding: 0.5rem;
    cursor: pointer;
    font-family: var(--font-deca);
    font-weight: 300;
    line-height: var(--header2-lh);
    outline: none;
    border: none;
    background: transparent;

    transition: all var(--animation-speed) ease-out;
    background-position: 1% 50%;
    background-size: 400% 300%;
    text-decoration: none;

    &:hover,
    &:focus-visible {
        filter: drop-shadow(0 0 5px var(--text1));
    }
`;

export const NavbarLogoutContainer = styled(FlexContainer)`
    margin-top: 8px;

    &:focus-visible {
        outline: none;
    }
`;

export const ConnectButton = styled.button`
    cursor: pointer;
    width: 100%;
    font-size: var(--header2-size);
    line-height: var(--header2-lh);
    color: var(--text1);
    border: none;
    outline: none;
    background: var(--accent1);
    padding: 6px 8px;
    gap: 4px;
    border-radius: var(--border-radius);

    &:hover,
    &:focus-visible {
        color: var(--accent1);
        background: var(--dark2);
        border: solid 1px var(--accent1);
    }
`;

export const IconRight = styled.span`
    margin-left: auto;
    svg {
        color: var(--text1);
    }
`;

// NavItem

const buttonSize = 'calc(var(--nav-size) * 0.5)';

export const NavItemButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
    border: none;
    background: transparent;

    &:focus-visible .icon_button {
        filter: brightness(1.2);
        background: var(--dark2);
    }
`;

interface IconButtonProps {
    square: boolean | undefined;
}

export const NavItemIconButton = styled(FlexContainer)<IconButtonProps>`
    height: ${buttonSize};
    width: 30px;
    height: 30px;
    background-color: var(--dark2);
    border-radius: ${(props) => (props.square ? '4px' : '50%')};
    padding: 5px;
    transition: var(--transition);
    cursor: pointer;

    &:hover,
    &:focus-visible {
        filter: brightness(1.2);
        background: var(--dark2);
    }

    svg {
        fill: var(--text1);
        width: 20px;
        height: 20px;
    }
`;

export const DropdownMenuContainer = styled(FlexContainer)`
    z-index: 99999;
    background-color: var(--dark2);
    padding: 0 4px;
    border-radius: var(--border-radius);
    height: 31px;
`;

export const MenuContent = styled.ul`
    width: 200px;
    padding: 12px;
    overflow: hidden;
    z-index: 2;
    background: var(--dark2);
    border-radius: var(--border-radius);
    z-index: 999;
    border: 1px solid var(--accent1);

    ul,
    li {
        text-decoration: none;
        list-style-type: none;
    }
`;

export const NetworkItem = styled(motion.li)`
    display: flex;
    flex-direction: row;
    align-items: center;
    transition: background 500ms;
    padding: 4px;
    cursor: pointer;
    text-decoration: none;

    &:hover {
        backdrop-filter: blur(16.5px);
        -webkit-backdrop-filter: blur(16.5px);
        border-radius: var(--border-radius);
    }
`;

export const ChainNameStatus = styled.div<{ active: boolean }>`
    display: flex;
    align-items: center;
    padding: 8px 0;
    font-size: var(--header2-size);
    width: 100%;
    color: var(--text1);
    z-index: 9999;

    &:hover,
    &:focus-visible {
        filter: drop-shadow(0 0 5px var(--text1));
    }

    img {
        margin-right: 0.5em;
        vertical-align: middle;
    }

    border-bottom: ${(props) =>
        props.active ? '1px solid var(--accent1)' : ''};
`;
