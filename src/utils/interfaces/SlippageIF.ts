import { Dispatch, SetStateAction } from 'react';

export interface SlippageIF {
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
}
