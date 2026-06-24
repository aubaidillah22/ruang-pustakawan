export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'
                } ` + className
            }
            style={{
                background: disabled
                    ? 'var(--text-secondary)'
                    : 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            }}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
