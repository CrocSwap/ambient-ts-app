import {
    BoxContainer,
    BoxInfoText,
    DetailedBoxContainer,
    InfoHeader,
} from './TableInfo.styles';

interface DetailedBoxPropsIF {
    label: string;
    value: string;
}
export function DetailedBox(props: DetailedBoxPropsIF) {
    const { label, value } = props;
    return (
        <BoxContainer>
            <DetailedBoxContainer>
                <InfoHeader>{label}</InfoHeader>
                <BoxInfoText>{value}</BoxInfoText>
            </DetailedBoxContainer>
        </BoxContainer>
    );
}
