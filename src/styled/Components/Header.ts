import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components/macro';
import { motion } from 'framer-motion';

import { FlexContainer } from '../Common';
const fixedStyles = `   
position: fixed;
top: 0;
z-index: 3;
`;

interface PrimaryHeaderProps {
    'data-testid': string;
    fixed: boolean;
}

interface LevelButtonProps {
    large?: boolean;
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
    ${({ fixed }) => fixed && fixedStyles};
     padding: 0 1rem;

    @media only screen and (min-width: 800px) {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        padding: 0 16px;
    }
    
`;

// Define the styles for LogoContainer
// inline block prevents clickable area from expanding larger than content
export const LogoContainer = styled(Link)`
    display: inline-block;
    flex-direction: row;
    gap: 8px;
    align-items: center;

    &:focus-visible img {
        box-shadow: var(--glow-light-box-shadow);
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

export const UnderlinedMotionDiv = styled(motion.div)`
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--text1);
    box-shadow: var(--glow-light-box-shadow);
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




