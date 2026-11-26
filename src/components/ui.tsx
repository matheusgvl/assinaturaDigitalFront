import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`container ${className}`}>{children}</div>; }
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`card ${className}`}>{children}</div>; }
export function Button({ children, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) { return <button className={`button ${variant}`} {...props}>{children}</button>; }
export function Label({ children, htmlFor }: { children: ReactNode; htmlFor: string }) { return <label className="label" htmlFor={htmlFor}>{children}</label>; }
export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input className="input" {...props} />; }
export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) { return <div className="page-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div>{actions}</div>}</div>; }
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'info' | 'success' | 'danger' }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
export function Alert({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'danger' | 'success' }) { return <div className={`alert alert-${tone}`} role="alert">{children}</div>; }
