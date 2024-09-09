import styled from 'styled-components/macro';
import { FlexContainer } from '../../../../styled/Common';

interface StyledProps {
    isFuta: boolean;
}

export const MainContainer = styled.div<StyledProps>`
    z-index: 15;
    width: 380px;
    height: calc(100vh - 9rem);
    position: absolute;
    border-radius: var(--border-radius);

    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    right: 0;
    top: 60px;

    @media (max-width: 500px) {
        width: 350px;
        font-size: 14px;
        right: 9px;
    }
`;

export const Container = styled(FlexContainer)<StyledProps>`
    z-index: 10;
    width: ${({ isFuta }) => (isFuta ? '95%' : '100%')};

    height: 400px;
    position: absolute;
    border-radius: var(--border-radius);
    box-shadow: 0px 35px 20px rgba(0, 0, 0, 0.3);
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    right: ${({ isFuta }) => (isFuta ? '2.2rem' : '0')};

    border: 1px solid var(--accent1);
`;

export const Header = styled.section`
    color: var(--text1);
    padding: 1rem;
    background: var(--dark1);
    border-radius: var(--border-radius);
    height: 50px;
`;
export const Footer = styled.section`
    padding: 1rem;
    background: var(--dark1);
    border-radius: var(--border-radius);
    height: 50px;
`;

export const Content = styled(FlexContainer)`
    height: 300px;
    overflow-y: scroll;
    padding: 8px;

    &::-webkit-scrollbar {
        width: 0.25rem;
    }
`;

export const FooterButton = styled.button<StyledProps>`
    padding: 4px 16px;
    font-size: var(--body-size);
    line-height: var(--body-lh);
    display: block;
    max-height: 3rem;
    cursor: pointer;
    text-align: center;
    background: transparent;
    text-transform: capitalize;
    color: ${({ isFuta }) => (isFuta ? 'var(--dark1)' : 'var(-accent5)')};

    border-radius: var(--border-radius);
    transition: var(--transition);
    background: var(--accent1);
    background-position: 1% 50%;
    background-size: 300% 300%;
    text-decoration: none;
    border: 1px solid var(--accent1);

    &:hover,
    &:focus-visible {
        color: var(--accent1);
        background: var(--dark2);
    }
`;
