export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-sm ' + className}
            style={{ color: '#ef4444' }}
        >
            {message}
        </p>
    ) : null;
}
