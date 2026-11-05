import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

const fieldClass = (error?: string) =>
    `w-full rounded border bg-white px-3 py-2 text-sm text-gray-900 focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none disabled:bg-gray-100 ${
        error ? 'border-danger' : 'border-line'
    }`;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

export default function FormInput({ label, error, hint, id, className = '', ...props }: InputProps) {
    const inputId = id ?? props.name ?? label;

    return (
        <div className="space-y-1">
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <input id={inputId} className={`${fieldClass(error)} ${className}`} {...props} />
            {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export function FormTextarea({ label, error, id, className = '', ...props }: TextareaProps) {
    const inputId = id ?? props.name ?? label;

    return (
        <div className="space-y-1">
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <textarea id={inputId} rows={3} className={`${fieldClass(error)} ${className}`} {...props} />
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}
