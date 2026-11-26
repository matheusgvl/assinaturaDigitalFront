import { NavLink } from 'react-router-dom';
type SidebarProps = { open?: boolean; onNavigate?: () => void };
export function Sidebar({ open = false, onNavigate }: SidebarProps) { return <aside className={`sidebar ${open ? 'sidebar-open' : ''}`} aria-label="Navegação da aplicação"><p className="sidebar-label">Workspace</p><NavLink onClick={onNavigate} to="/dashboard">⌂ <span>Painel</span></NavLink><NavLink onClick={onNavigate} to="/sign">✎ <span>Assinar documento</span></NavLink><NavLink onClick={onNavigate} to="/verify">✓ <span>Verificar documento</span></NavLink></aside>; }
