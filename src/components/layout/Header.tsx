import { Link } from 'react-router-dom';

type HeaderProps = { onMenuToggle?: () => void; menuOpen?: boolean };
export function Header({ onMenuToggle, menuOpen = false }: HeaderProps) { return <header className="site-header"><button className="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={onMenuToggle}>☰</button><Link className="brand" to="/">Signa<span>PDF</span></Link><div className="header-spacer" /></header>; }
