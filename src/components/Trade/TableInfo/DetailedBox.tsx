import { FlexContainer } from '../../../styled/Common';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import {
    BoxContainer,
    BoxInfoText,
    DetailedBoxContainer,
    InfoHeader,
} from './TableInfo.styles';

interface DetailedBoxPropsIF {
    label: string;
    value: string;
    tooltipText?: string | JSX.Element;
}
export function DetailedBox(props: DetailedBoxPropsIF) {
    const { label, value, tooltipText } = props;
    return (
        <BoxContainer>
            <DetailedBoxContainer>
                <FlexContainer gap={8}>
                    <InfoHeader>{label}</InfoHeader>
                    {tooltipText && (
                        <TooltipComponent
                            title={tooltipText}
                            placement='bottom'
                        />
                    )}
                </FlexContainer>

                <BoxInfoText>{value}</BoxInfoText>
            </DetailedBoxContainer>
        </BoxContainer>
    );
}
