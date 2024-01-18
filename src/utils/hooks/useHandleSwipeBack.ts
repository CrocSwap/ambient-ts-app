// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useHandleSwipeBack(ref: any, exceptionDivRef?: any) {
    const handleSwipeBack = (event: WheelEvent | TouchEvent) => {
        if (
            (exceptionDivRef.current &&
                exceptionDivRef.current.contains(event.target as Node)) ||
            event.target instanceof HTMLInputElement
        ) {
            return;
        }

        event.preventDefault();
    };

    ref.current?.addEventListener('wheel', handleSwipeBack, { passive: false });
    ref.current?.addEventListener('touchmove', handleSwipeBack, {
        passive: false,
    });

    return () => {
        ref.current?.removeEventListener('wheel', handleSwipeBack);
        ref.current?.removeEventListener('touchmove', handleSwipeBack);
    };
}

export default useHandleSwipeBack;
