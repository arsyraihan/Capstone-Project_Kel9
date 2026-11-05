import { InertiaLinkProps, Link } from '@inertiajs/react';
import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'danger' | 'secondary';
type Size = 'md' | 'sm';

const variants: Record<Variant, string> = {
    primary: 'bg-navy text-white hover:bg-navy-dark border border-navy',
    danger: 'bg-danger text-white hover:bg-danger-dark border border-danger',
    secondary: 'bg-white text-gray-700 hover:bg-gray-100 border border-line',
};

const sizes: Record<Size, string> = {
    md: 'px-4 py-2 text-sm',
    sm: 'px-2.5 py-1 text-xs',
};

const base = 'inline-flex items-center justify-center gap-2 rounded font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 print:hidden';

interface StyleProps {
    variant?: Variant;
    size?: Size;
}

export default function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }: StyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button type={type} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

/** Tautan Inertia dengan tampilan tombol. */
export function LinkButton({ variant = 'primary', size = 'md', className = '', ...props }: StyleProps & Omit<InertiaLinkProps, 'size' | 'variant'>) {
    return <Link className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}
