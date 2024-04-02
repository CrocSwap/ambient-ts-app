import { skinMethodsIF } from '../../App/hooks/useSkin';

interface propsIF {
    skin: skinMethodsIF;
}

export default function TestPage(props: propsIF) {
    const { skin } = props;
    return (
        <div>
            <button onClick={() => skin.changeTo('purple_dark')}>
                Purple Dark
            </button>
            <button onClick={() => skin.changeTo('orange')}>Orange</button>
        </div>
    );
}
