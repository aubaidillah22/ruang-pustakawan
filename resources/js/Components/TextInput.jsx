import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-xl shadow-sm ' +
                'bg-[var(--bg-color)] text-[var(--text-primary)] ' +
                'border border-[var(--border-color)] ' +
                'focus:border-[var(--primary-light)] focus:ring-2 focus:ring-[var(--primary-light)] focus:ring-opacity-30 focus:outline-none ' +
                className
            }
            ref={localRef}
        />
    );
});
