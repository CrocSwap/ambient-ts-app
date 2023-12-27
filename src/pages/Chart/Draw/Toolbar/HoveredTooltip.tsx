import { TooltipContainer, TooltipArrow, Tooltip } from './HoveredTooltipCss';

function HoveredTooltip(props: { hoveredTool: string }) {
    const { hoveredTool } = props;

    return (
        <TooltipContainer>
            <Tooltip>
                <TooltipArrow></TooltipArrow>
                <label>{hoveredTool}</label>
            </Tooltip>
        </TooltipContainer>
    );
}

export default HoveredTooltip;
