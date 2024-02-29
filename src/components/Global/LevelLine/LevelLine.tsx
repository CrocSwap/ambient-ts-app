import styled from 'styled-components';

interface LevelLineProps {
    percentage: number;
    width?: string;
    height?: string;
}

const Container = styled.div<LevelLineProps>`
    width: ${(props) => (props.width ? props.width : '100%')};
    height: ${(props) => (props.height ? props.height : '6px')};
    flex-shrink: 0;
    border-radius: 10px;
    background-color: rgba(115, 113, 252, 0.5);
    position: relative;
`;

const FilledArea = styled.div<{ percentage: number }>`
    height: 100%;
    width: ${(props) => `${props.percentage}%`};
    border-radius: 10px;
    background-color: rgba(115, 113, 252, 1);
    position: absolute;
    top: 0;
    left: 0;
`;
export default function LevelLine(props: LevelLineProps) {
    const { percentage, width, height } = props;

    return (
        <Container width={width} height={height} percentage={percentage}>
            <FilledArea percentage={percentage} />
        </Container>
    );
}
