import { Link, NavLink } from 'react-router-dom';

import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

import { FlexContainer, GridContainer } from '../Common';
const fixedStyles = `   
position: fixed;
top: 0;
z-index: 3;
`;

interface PrimaryHeaderProps {
    'data-testid': string;
    fixed: boolean;
}

// Define the styles for PrimaryHeader
export const PrimaryHeader = styled.header<PrimaryHeaderProps>`
    width: 100%;
    height: 56px;
    background: var(--dark1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--navbar-border);
    ${({ fixed }) => fixed && fixedStyles}

    @media only screen and (min-width: 800px) {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        padding: 0 16px;
    }
`;

// Define the styles for LogoContainer
export const LogoContainer = styled(Link)`
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;

    &:focus-visible img {
        box-shadow: 0px 0px 36px rgba(205, 193, 255, 0.2),
            0px 0px 21px rgba(205, 193, 255, 0.2),
            0px 0px 12px rgba(205, 193, 255, 0.2),
            0px 0px 7px rgba(205, 193, 255, 0.2), 0px 0px 4px var(--accent5),
            0px 0px 2px rgba(205, 193, 255, 0.2);
    }

    @media only screen and (min-width: 800px) {
        img:nth-of-type(1) {
            margin: 0 4px;
        }
    }

    @media (max-width: 1200px) {
        img:nth-of-type(2) {
            display: block;
            margin: 0 4px;
        }
    }

    @media only screen and (min-width: 1180px) {
        vertical-align: middle;
        justify-content: flex-start;
    }
`;

// Define the styles for LogoText
export const LogoText = styled.img`
    max-width: 70%;
    max-height: 70%;
`;

// Define the styles for RightSide
export const RightSide = styled.div`
    @media only screen and (min-width: 1180px) {
        vertical-align: middle;
        display: flex;
        justify-content: flex-end;
    }
`;

// Define the styles for TradeNowDiv
export const TradeNowDiv = styled(FlexContainer)`
    width: 380px;
    padding: 0 1rem;
`;

interface PrimaryNavigationProps {
    dataVisible: boolean;
}
export const PrimaryNavigation = styled.nav<PrimaryNavigationProps>`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2rem;

    @media (max-width: 800px) {
        display: none;
        position: fixed;
        z-index: 1000;
        inset: 0 0 0 30%;
        padding: min(30vh, 10rem) 2em;
        transform: translateX(100%);
        transition: transform var(--animation-speed) ease-in-out;
        flex-direction: column;
        backdrop-filter: blur(1rem);
        background: rgba(23, 29, 39, 0.5);
        backdrop-filter: blur(13px);
        -webkit-backdrop-filter: blur(13px);
        border-radius: 10px;
        font-size: calc(var(--header2-size) + 0.5rem);
        line-height: calc(var(--header2-lh) + 0.5rem);
        ${({ dataVisible }) => dataVisible && 'transform: translateX(0%);'}
    }

    @media only screen and (min-width: 1180px) {
        vertical-align: middle;
        justify-content: center;
    }
`;

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
        border: 1px solid var(--text2);
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

export const UnderlinedMotionDiv = styled(motion.div)`
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--text1);
    box-shadow: 0px 0px 36px rgba(205, 193, 255, 0.2),
        0px 0px 21px rgba(205, 193, 255, 0.2),
        0px 0px 12px rgba(205, 193, 255, 0.2),
        0px 0px 7px rgba(205, 193, 255, 0.2), 0px 0px 4px var(--accent5),
        0px 0px 2px rgba(205, 193, 255, 0.2);
`;

interface AuthenticateButtonProps {
    desktopScreen: boolean;
}

export const AuthenticateButton = styled.button<AuthenticateButtonProps>`
    cursor: pointer;
    background: var(--accent1);
    border: none;
    outline: none;
    color: var(--dark2);
    font-weight: 300;
    font-size: var(--header2-size);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 4px;

    border-radius: var(--border-radius);
    width: 155px;
    height: 28px;
    transition: box-shadow var(--animation-speed) ease-in-out;

    ${({ desktopScreen }) => desktopScreen && 'width: 140px;'}

    &:hover,
    &:focus-visible {
        box-shadow: 0px 0px 36px rgba(205, 193, 255, 0.2),
            0px 0px 21px rgba(205, 193, 255, 0.2),
            0px 0px 12px rgba(205, 193, 255, 0.2),
            0px 0px 7px rgba(205, 193, 255, 0.2), 0px 0px 4px var(--accent5),
            0px 0px 2px rgba(205, 193, 255, 0.2);
    }
`;

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
    right: -40px;
    z-index: 9999;
    padding: 8px 1rem;

    opacity: 1;
    bottom: 85px;
    pointer-events: auto;
`;

// Account

export const TitleGradientButton = styled.button`
    outline: none;
    border: none;
    background: var(--dark2);
    padding: 7.5px 12px 7.5px 6px;
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    cursor: pointer;

    &:hover,
    &:focus-visible {
        box-shadow: 0px 0px 36px rgba(205, 193, 255, 0.2),
            0px 0px 21px rgba(205, 193, 255, 0.2),
            0px 0px 12px rgba(205, 193, 255, 0.2),
            0px 0px 7px rgba(205, 193, 255, 0.2), 0px 0px 4px var(--accent5),
            0px 0px 2px rgba(205, 193, 255, 0.2);
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
    right: 8px;
    width: 450px;
    height: 510px;
    border: none;
    overflow: hidden;
    transition: all var(--animation-speed) ease;
    z-index: 999;
    background: var(--dark1);
    border-radius: var(--border-radius);
    box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.25);
    text-align: start;

    @media only screen and (max-width: 600px) {
        width: auto;
        height: auto;
        background: transparent;
        border-radius: 4px;
    }
`;

// NavbarDropdownMenu

export const NavbarDropdown = styled.div`
    position: absolute;
    top: 60px;
    width: 240px;
    height: 376px;
    transform: translateX(-45%);
    border: none;
    padding: 1rem;
    overflow: hidden;
    transition: all var(--animation-speed) ease;

    background: var(--dark2);
    border-radius: var(--border-radius);
    box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.25);
    z-index: 999;
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
    background-color: var(--dark2);
    border-radius: ${(props) => (props.square ? '4px' : '50%')};
    padding: 5px;
    transition: all var(--animation-speed) ease-in-out;
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

// NetworkSelector

export const DropdownMenuContainer = styled(FlexContainer)`
    z-index: 99999;
    background-color: var(--dark2);
    padding: 0 4px;
    border-radius: 4px;
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
    padding: 8px 0;
    cursor: pointer;
    text-decoration: none;

    &:hover {
        backdrop-filter: blur(16.5px);
        -webkit-backdrop-filter: blur(16.5px);
        border-radius: 4px;
    }
`;

export const ChainNameStatus = styled.div`
    padding: 0.6rem 0;
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
`;
