import Swap from '../../platformAmbient/Swap/Swap';
import ColorToggle from './ColorToggle';
import styles from './CSSDebug.module.css';

const cssVariables = {
    colors: [
        '--blur-bg',
        '--text1',
        '--text2',
        '--text3',
        '--dark1',
        '--dark2',
        '--dark3',
        '--dark4',
        '--accent1',
        '--accent2',
        '--accent3',
        '--accent4',
        '--accent5',
        '--positive',
        '--negative',
        '--other-green',
        '--other-red',
        '--border',
        '--dark-border-color',
    ],
};

export type toggleableColors = (typeof cssVariables.colors)[number];

export default function CSSDebug() {

    return (
        <>
            <section
                className={styles.color_toggles}
            >
            {
                cssVariables.colors.map((c: toggleableColors) => (
                    <ColorToggle
                        key={c}
                        cssProperty={c}
                    />
                ))
            }
            </section>
            <Swap />
        </>
    );
}
