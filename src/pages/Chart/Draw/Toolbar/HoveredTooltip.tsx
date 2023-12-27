import {
    TooltipContainer,
    TooltipArrow,
    Tooltip,
    TooltipLabel,
} from './HoveredTooltipCss';

function HoveredTooltip(props: { hoveredTool: string }) {
    const { hoveredTool } = props;

    return (
        <TooltipContainer>
            <Tooltip>
                <TooltipArrow></TooltipArrow>
                <TooltipLabel>{hoveredTool}</TooltipLabel>
            </Tooltip>
        </TooltipContainer>
    );
}

export default HoveredTooltip;
