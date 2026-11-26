import { Alert, Button, Card } from './ui';
export function LoadingSpinner() { return <span className="spinner" aria-hidden="true" />; }
export function LoadingState({ label = 'Carregando…' }: { label?: string }) { return <div className="feedback" role="status"><LoadingSpinner /><span>{label}</span></div>; }
export function ErrorState({ onRetry }: { onRetry?: () => void }) { return <Card className="feedback-card"><Alert tone="danger">Não foi possível carregar este conteúdo. Tente novamente mais tarde.</Alert>{onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}</Card>; }
export function EmptyState({ title = 'Nada por aqui ainda', description = 'Quando houver informações disponíveis, elas aparecerão nesta área.' }: { title?: string; description?: string }) { return <Card className="empty-state"><h2>{title}</h2><p>{description}</p></Card>; }
