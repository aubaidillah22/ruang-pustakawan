export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                } ` + className
            }
            style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
            }}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
