import {
    TooltipContainer,
    TooltipArrow,
    Tooltip,
    TooltipLabel,
} from './HoveredTooltipCss';

function HoveredTooltip(props: { hoveredTool: string }) {
    const { hoveredTool } = props;

    return (
        <Tooltip>
            <TooltipArrow></TooltipArrow>
            <TooltipLabel>{hoveredTool}</TooltipLabel>
        </Tooltip>
    );
}

export default HoveredTooltip;
