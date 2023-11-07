import { MouseEventHandler, useEffect, KeyboardEventHandler } from 'react';
import { ToggleComponent } from './Form.styles';
interface TogglePropsIF {
    isOn: boolean;
    onColor?: string;
    Width?: boolean | number;
    id: string;
    handleToggle:
        | MouseEventHandler<HTMLDivElement>
        | KeyboardEventHandler<HTMLDivElement>
        | undefined
        // eslint-disable-next-line
        | any;
    buttonColor?: string;
    disabled?: boolean;
}

export default function Toggle(props: TogglePropsIF) {
    const { isOn, handleToggle, id, disabled } = props;

    const enterFunction = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleToggle;
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', enterFunction, false);
        return () => {
            document.removeEventListener('keydown', enterFunction, false);
        };
    }, []);

    return (
        <ToggleComponent
            data-isOn={isOn}
            aria-checked={isOn}
            onClick={handleToggle}
            id={`${id}switch`}
            tabIndex={0}
            role='checkbox'
            disabled={!!disabled}
        >
            <div
                style={{
                    width: '18px',
                    height: '18px',
                    background: 'var(--text1)',
                    borderRadius: '40px',
                }}
            />
        </ToggleComponent>
    );
}
