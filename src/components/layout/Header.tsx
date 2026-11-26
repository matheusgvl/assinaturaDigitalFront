import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../app/session';

type HeaderProps = { onMenuToggle?: () => void; menuOpen?: boolean };
export function Header({ onMenuToggle, menuOpen = false }: HeaderProps) { const { user, signOut } = useSession(); const navigate = useNavigate(); async function logout() { await signOut(); navigate('/login', { replace: true }); } return <header className="site-header"><button className="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={onMenuToggle}>☰</button><Link className="brand" to="/">Signa<span>PDF</span></Link><div className="header-spacer" />{user && <span className="header-user">{user.name}</span>}<button type="button" className="button ghost header-logout" onClick={() => void logout()}>Sair</button></header>; }
