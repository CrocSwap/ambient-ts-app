import styled from 'styled-components/macro';
import Button from '../../components/Form/Button';
import { Dispatch, SetStateAction } from 'react';

const Wrapper = styled.div`
    border-radius: 8px;
    padding: 24px;
    max-width: 400px;
    margin: 0 auto;
    text-align: center;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
    font-size: 24px;
    margin-bottom: 16px;
    color: #333;
`;

const Description = styled.p`
    font-size: 16px;
    color: #666;
    margin-bottom: 24px;
`;

interface InitSettingsProps {
    setCurrentStep: Dispatch<SetStateAction<number>>;
}

export default function InitSettings(props: InitSettingsProps) {
    return (
        <Wrapper>
            <Title>Init Settings</Title>
            <Description>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Laboriosam expedita ab repellendus magnam. Deleniti error
                perspiciatis molestias ipsum, fuga eligendi hic laborum. Odit
                omnis ad adipisci asperiores quos, voluptatibus, sapiente ullam
                est tempore enim eos. Officiis, eveniet? Nihil, eaque sed!
            </Description>
            <Button title='Confirm' action={() => props.setCurrentStep(0)} />
        </Wrapper>
    );
}
