import React, { useEffect, useRef, useState } from 'react';
import { getLS } from '../ChatUtils';
import styles from './DomDebugger.module.css';
import { clearDomDebug } from './DomDebuggerUtils';
/* eslint-disable @typescript-eslint/no-explicit-any */

// TODO network tab logger will be implemented for dom debugger to track requests been sent from app
// (function() {
//     const originalFetch = window.fetch;
//     window.fetch = async function(...args) {
//       console.log('Fetch request made to:', args);
//         console.log(args[0])
//         console.log(args[1]?.method)
//         console.log('........')
//       return originalFetch.apply(this, args);

//     };
//   })();

export default function DomDebugger() {
    const debugWhiteList = [
        'localhost',
        'proven-chat-test',
        'ambient-proven-test',
    ];

    const domDebuggerRef = useRef<HTMLDivElement>(null);

    const [debugEnabled, setDebugEnabled] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef<boolean>(false);
    isDraggingRef.current = isDragging;
    const [dragStart, setDragStart] = useState([0, 0]);

    useEffect(() => {
        const lsVal = getLS('debugEnabled');
        if (lsVal) {
            let debug = false;
            for (const domain of debugWhiteList) {
                if (window.location.href.indexOf(domain) >= 0) {
                    debug = true;
                    break;
                }
            }
            setDebugEnabled(debug);
        }
    }, []);

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log(e);
        setIsDragging(true);
        setDragStart([e.clientX, e.clientY]);
    };

    const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log(e);
        setIsDragging(false);
    };

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return;

        const diffX = e.clientX - dragStart[0];
        const diffY = e.clientX - dragStart[1] * -1;

        if (domDebuggerRef.current) {
            const el = domDebuggerRef.current;

            el.style.left = diffX + 'px';
            el.style.top = diffY + 'px';
        }
    };

    return (
        <>
            {debugEnabled && (
                <div
                    ref={domDebuggerRef}
                    id='dom-debugger'
                    className={
                        styles.dom_debugger_wrapper + '  ' + styles.active
                    }
                >
                    {' '}
                    <div
                        className={styles.dom_debug_clear}
                        onClick={clearDomDebug}
                    >
                        clear
                    </div>
                    <div
                        className={styles.dom_debug_toolbar}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                        onMouseMove={onMouseMove}
                    ></div>
                    <div className={styles.dom_debug_nodes_wrapper}></div>
                </div>
            )}
        </>
    );
}
