// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useHandleSwipeBack(ref: any) {
    const handleSwipeBack = (event: WheelEvent | TouchEvent) => {
        event.preventDefault();
    };

    ref.current?.addEventListener('wheel', handleSwipeBack, { passive: false });
    ref.current?.addEventListener('touchstart', handleSwipeBack, {
        passive: true,
    });

    return () => {
        ref.current?.removeEventListener('wheel', handleSwipeBack);
        ref.current?.removeEventListener('touchstart', handleSwipeBack);
    };
}

export default useHandleSwipeBack;
