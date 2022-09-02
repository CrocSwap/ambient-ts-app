import Button from '../../Global/Button/Button';

interface IRemoveRangeButtonProps {
    removeFn: () => void;
    title: string;
}

export default function RemoveRangeButton(props: IRemoveRangeButtonProps) {
    const { removeFn, title } = props;

    return (
        <div>
            <Button title={title} disabled={false} action={removeFn} />
        </div>
    );
}
