import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface ButtonProps {
    inNav?: boolean;
}
export const StyledLink = styled(Link)<ButtonProps>`
    width: 100%;
    z-index: 2;
    border-radius: var(--border-radius);
    background: var(--title-gradient);
    max-width: 16rem;
    max-height: 3rem;
    padding: 1px;
    height: 54px;
    display: flex;
    justify-content: center;
    align-items: center;
    outline: none;
    border: none;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    border-radius: var(--border-radius);

    ${(props) =>
        props.inNav &&
        `
        max-width: 10rem;
        max-height: 2rem;
        height: 54px;
    `}

    &:hover, &:focus-visible {
        box-shadow: var(--glow-box-shadow);
    }
`;

export const ButtonText = styled.p<ButtonProps>`
    font-family: var(--font-logo);
    font-weight: 100;
    font-size: 30px;
    line-height: 38px;
    color: var(--accent1) !important;

    ${(props) =>
        props.inNav &&
        `
        font-size: 20px;
        line-height: 28px;
    `}
`;
