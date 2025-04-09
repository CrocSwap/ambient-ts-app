import { useRef } from 'react';
import styles from './DebugDiv.module.css';

interface DebugDivPropsIF {
    children: React.ReactNode;
    left?: number;
    top?: number;
    title?: string;
}

export default function DebugDiv(props: DebugDivPropsIF) {
    const debugDivRef = useRef<HTMLDivElement>(null);

    // dragging action will be implemented with custom way on that component

    // useEffect(() => {
    //     if (debugDivRef.current) {
    //         const position = { x: 0, y: 0 };

    //         interact(debugDivRef.current).draggable({
    //             listeners: {
    //                 // start(event) {
    //                 //     console.log(event.type, event.target);
    //                 // },
    //                 move(event) {
    //                     position.x += event.dx;
    //                     position.y += event.dy;
    //                     event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
    //                 },
    //             },
    //         });
    //     }
    // }, []);

    return (
        <>
            <div
                ref={debugDivRef}
                className={styles.debug_div}
                style={{ left: props.left, top: props.top }}
            >
                {props.title && (
                    <div className={styles.debug_div_title}>{props.title}</div>
                )}

                <div className={styles.debug_div_content}>{props.children}</div>
            </div>
        </>
    );
}
