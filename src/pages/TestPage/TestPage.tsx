import { styled } from 'styled-components';
import { FlexContainer, FontSize } from '../../styled/Common';

export default function TestPage() {
    const CustomDiv = styled.div<{ fontSize?: string }>`
        /* Other styles for your div go here */
        ${FontSize}
    `;
    return (
        <section>
            <FlexContainer
                gap={20}
                fullHeight
                flexDirection='row'
                justifyContent='space-between'
            >
                {/* Your content goes here */}
                <CustomDiv fontSize='body'>Hello</CustomDiv>
                <div>Item 1</div>
                <div>Item 2</div>
                <div>Item 3</div>
                <div>Item 4</div>
                <div>Item 5</div>
                <div>Item 6</div>
            </FlexContainer>
        </section>
    );
}
