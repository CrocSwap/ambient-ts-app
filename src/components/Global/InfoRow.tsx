import { memo } from 'react';
import { FlexContainer } from '../../styled/Common';
import Tooltip from './Tooltip/Tooltip';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

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
            <FlexContainer
                flexDirection='row'
                alignItems='center'
                gap={4}
                style={{ zIndex: 99 }}
            >
                <p>{title}</p>

                <Tooltip content={explanation} position='right'>
                    <AiOutlineQuestionCircle size={13} />
                </Tooltip>
            </FlexContainer>
            <div>{content}</div>
        </FlexContainer>
    );
}

export default memo(InfoRow);
