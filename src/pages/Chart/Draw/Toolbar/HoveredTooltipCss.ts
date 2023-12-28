import styled from 'styled-components';

const TooltipContainer = styled.div`
    position: absolute;
    z-index: 999;
`;

const Tooltip = styled.div`
    position: absolute;

    display: flex;

    z-index: 99;

    background: #202a38;

    box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.8);

    border-radius: 4px;

    height: 22px;
    width: 125px;

    left: 20px;
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

    margin-top: -6px;
    border-width: 6px;
    border-style: solid;
    border-color: transparent #202a38 transparent transparent;
`;

const TooltipLabel = styled.label`
    color: white;

    padding: 0px;
`;

export { TooltipContainer, Tooltip, TooltipArrow, TooltipLabel };
