export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={`block text-sm font-medium ` + className}
            style={{ color: 'var(--text-primary)' }}
        >
            {value ? value : children}
        </label>
    );
}
