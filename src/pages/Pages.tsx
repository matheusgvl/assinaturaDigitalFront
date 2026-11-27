import { Link } from 'react-router-dom'; import { Alert, Badge, Card, Container, PageHeader } from '../components/ui'; import { RegisterForm } from '../components/auth/RegisterForm'; import { LoginForm } from '../components/auth/LoginForm'; import { PasskeyRegistration } from '../components/auth/PasskeyRegistration'; import { PasskeyLogin } from '../components/auth/PasskeyLogin'; import { TotpSetup } from '../components/auth/TotpSetup'; import { TotpChallenge } from '../components/auth/TotpChallenge'; import { RecoveryCodes } from '../components/auth/RecoveryCodes'; import { useSession } from '../app/session';
const Pending = ({ title, text }: { title: string; text: string }) => <Container className="page-card"><Card><PageHeader eyebrow="Em preparação" title={title} description={text} /><Alert>Esta funcionalidade será integrada à API nas próximas etapas.</Alert><Badge>Backend necessário</Badge></Card></Container>;
export function HomePage() { return <section className="hero"><div><p className="eyebrow">Assinatura digital segura</p><h1>Documentos confiáveis, do início ao fim.</h1><p className="lead">Uma base segura para assinar e verificar PDFs com transparência, integridade e autenticidade.</p><div className="actions"><Link className="button primary" to="/login">Acessar plataforma</Link><Link className="button secondary" to="/verify">Verificar documento</Link></div></div><div className="hero-panel"><div className="shield">✓</div><h2>Segurança por projeto</h2><p>Arquitetura preparada para autenticação forte e assinatura criptográfica.</p></div></section>; }
export function LoginPage() { return <Container className="auth-page"><LoginForm /><PasskeyLogin /></Container>; }
export function RegisterPage() { return <Container className="auth-page"><RegisterForm /></Container>; }
export function PasskeyPage() { return <Container className="auth-page"><PasskeyRegistration /></Container>; }
export function TotpPage() { return <Container className="auth-page"><TotpSetup /></Container>; }
export function TotpLoginPage() { return <Container className="auth-page"><TotpChallenge /></Container>; }
export function RecoveryCodesPage() { return <Container className="auth-page"><RecoveryCodes /></Container>; }
const shortcuts = [
  { to: '/sign', title: 'Assinar documento', text: 'Envie um PDF e aplique sua assinatura digital.' },
  { to: '/verify', title: 'Verificar documento', text: 'Confira a autenticidade e a integridade de um PDF assinado.' },
  { to: '/passkeys', title: 'Dispositivos', text: 'Gerencie as passkeys vinculadas à sua conta.' },
  { to: '/security/sessions', title: 'Sessões ativas', text: 'Veja onde sua conta está conectada.' },
];
export function DashboardPage() { const { user } = useSession(); return <Container className="page-card"><PageHeader eyebrow="Painel" title={user ? `Olá, ${user.name}` : 'Painel'} description="Escolha o que deseja fazer." /><nav className="dashboard-grid" aria-label="Atalhos do painel">{shortcuts.map(item => <Link key={item.to} className="card dashboard-shortcut" to={item.to}><h2>{item.title}</h2><p>{item.text}</p></Link>)}</nav></Container>; }
export function SessionsPage() { return <Pending title="Sessões ativas" text="A lista de sessões será implementada na issue de dispositivos e sessões." />; }
export function SignDocumentPage() { return <Pending title="Assinar documento" text="O fluxo de envio, posicionamento e assinatura de PDFs será implementado em uma próxima issue." />; }
export function VerifyDocumentPage() { return <Pending title="Verificar documento" text="A verificação pública depende do endpoint de validação do backend." />; }
export function NotFoundPage() { return <section className="card page-card"><p className="eyebrow">Erro 404</p><h1>Página não encontrada</h1><p>O endereço informado não corresponde a uma página disponível.</p><Link className="button primary" to="/">Voltar ao início</Link></section>; }
