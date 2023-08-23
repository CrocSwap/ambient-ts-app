import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

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
export const TradeNowDiv = styled.div`
    width: 380px;
    display: flex;
    justifycontent: flex-end;
    alignitems: center;
    padding: 0 1rem;
`;

// Define the styles for AccountDiv
export const AccountDiv = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

// Define the styles for BranchNameDiv
export const BranchNameDiv = styled.div`
    font-size: 12px;
    color: orange;
`;

// Define the styles for BranchDiv
export const BranchDiv = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
`;

interface PrimaryNavigationProps {
    dataVisible: boolean;
}
export const PrimaryNavigation = styled.nav<PrimaryNavigationProps>`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--gap, 2rem);

    @media (max-width: 800px) {
        display: none;
        --gap: 2em;
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
