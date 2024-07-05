interface CommentsInputProps {
    sendMessage: (message: string) => void;
}

export default function CommentsInput(props: CommentsInputProps) {
    console.log(props);

    return (
        <>
            <input placeholder='' />
        </>
    );
}
