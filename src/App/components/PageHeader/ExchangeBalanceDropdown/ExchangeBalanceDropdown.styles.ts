import styled from 'styled-components';

export const Dropdown = styled.div`
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
