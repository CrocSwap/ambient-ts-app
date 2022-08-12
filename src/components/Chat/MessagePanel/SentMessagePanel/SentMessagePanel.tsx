interface SentMessageProps {
    message: string;
}

export default function SentMessagePanel(props: SentMessageProps) {
    return (
        <div>
            <p>{props.message}</p>
        </div>
    );
}
