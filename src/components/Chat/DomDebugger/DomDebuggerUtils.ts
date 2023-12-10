import styles from './DomDebugger.module.css';

export const domDebug = (key: string, value: any) => {
    const el = document.getElementById('dom-debugger');
    if (el === null) {
        return; // not in debug mode
    }

    el.classList.add(styles.active);

    const dbgNode = el?.querySelectorAll('.dbg-' + key)[0];
    if (dbgNode) {
        const valueDiv = dbgNode.querySelectorAll(
            '.' + styles.dom_debug_value,
        )[0];
        valueDiv.innerHTML = value;
    } else {
        const newNode = document.createElement('div');
        newNode.classList.add(styles.dom_debug_node);
        newNode.classList.add('dbg-' + key);
        el?.appendChild(newNode);

        const keyDiv = document.createElement('div');
        keyDiv.classList.add(styles.dom_debug_key);
        keyDiv.innerHTML = key;

        newNode.appendChild(keyDiv);

        const valueDiv = document.createElement('div');
        valueDiv.classList.add(styles.dom_debug_value);
        valueDiv.innerHTML = value;
        newNode.appendChild(valueDiv);
    }
};
