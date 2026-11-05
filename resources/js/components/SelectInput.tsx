import { SelectHTMLAttributes } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

/** Dropdown. Isi <option> diberikan lewat children. */
export default function SelectInput({ label, error, id, className = '', children, ...props }: Props) {
    const inputId = id ?? props.name ?? label;

    return (
        <div className="space-y-1">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <select
                id={inputId}
                className={`w-full rounded border bg-white px-3 py-2 text-sm text-gray-900 focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none ${
                    error ? 'border-danger' : 'border-line'
                } ${className}`}
                {...props}
            >
                {children}
            </select>
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}
