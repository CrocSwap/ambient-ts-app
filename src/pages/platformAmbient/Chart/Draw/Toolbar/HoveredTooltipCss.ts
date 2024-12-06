import styled from 'styled-components';

const TooltipContainer = styled.div`
    position: absolute;
    z-index: 999;
`;

const Tooltip = styled.div<{ height: number; width: number }>`
    position: absolute;

    display: flex;

    z-index: 999;

    background: #202a38;

    box-shadow: 0.5px 0.5px 1px 0.5px rgba(0, 0, 0, 0.5);

    border-radius: 4px;

    height: ${({ height }) => height + 'px'};
    width: ${({ width }) => width + 'px'};

    left: 35px;
    top: 0px;

    padding: 2px;

    text-align: center;
    justify-content: center;
    align-items: center;

    pointer-events: none;

    font-size: 11.5px;
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

export { Tooltip, TooltipArrow, TooltipContainer, TooltipLabel };
