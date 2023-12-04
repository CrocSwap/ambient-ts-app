import { memo } from 'react';
import { FlexContainer } from '../../styled/Common';
import TooltipComponent from './TooltipComponent/TooltipComponent';

interface ItemRowPropsIF {
    title: string;
    content: string | JSX.Element;
    explanation: string;
}

function InfoRow(props: ItemRowPropsIF) {
    const { title, content, explanation } = props;

    return (
        <FlexContainer
            flexDirection='row'
            alignItems='center'
            justifyContent='space-between'
            fontSize='body'
            color='text2'
            padding='4px'
        >
            <FlexContainer flexDirection='row' alignItems='center' gap={4}>
                <p>{title}</p>
                <TooltipComponent title={explanation} placement={'right'} />
            </FlexContainer>
            <div>{content}</div>
        </FlexContainer>
    );
}

export default memo(InfoRow);
