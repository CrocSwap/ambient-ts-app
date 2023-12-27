import styled from 'styled-components';

const TooltipContainer = styled.div`
    position: absolute;
    z-index: 99;
`;

const Tooltip = styled.div`
    position: absolute;

    display: flex;

    z-index: 99;

    background: var(--dark3);

    box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.8);

    border-radius: 4px;

    height: 22px;
    width: 125px;

    left: 24px;
    top: -17px;

    padding: 2px;

    text-align: center;
    justify-content: center;
    align-items: center;

    pointer-events: none;
`;

const TooltipArrow = styled.div`
    position: absolute;

    top: 50%;
    right: 100%;

    margin-top: -7px;
    border-width: 7px;
    border-style: solid;
    border-color: transparent var(--dark3) transparent transparent;
`;

export { TooltipContainer, Tooltip, TooltipArrow };
