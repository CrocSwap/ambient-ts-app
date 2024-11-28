import { Tooltip, TooltipArrow, TooltipLabel } from './HoveredTooltipCss';

function HoveredTooltip(props: {
    hoveredTool: string;
    height: number;
    width: number;
    arrow: boolean;
}) {
    const { hoveredTool, width, height, arrow } = props;

    return (
        <Tooltip width={width} height={height}>
            {arrow && <TooltipArrow></TooltipArrow>}
            <TooltipLabel>{hoveredTool}</TooltipLabel>
        </Tooltip>
    );
}

export default HoveredTooltip;
