import Button from '../../Global/Button/Button';

interface IRemoveRangeButtonProps {
    removeFn: () => void;
    title: string;
    disabled?: boolean;
}

export default function RemoveRangeButton(props: IRemoveRangeButtonProps) {
    const { removeFn, title } = props;

    return (
        <div>
            <Button
                title={title}
                disabled={props.disabled}
                action={removeFn}
                flat={true}
            />
        </div>
    );
}
