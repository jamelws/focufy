import QuestionsPageClient from './QuestionsPageClient';

// Estas configuraciones SÍ van aquí, porque este es un Componente de Servidor.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Esta página ahora solo se encarga de renderizar el componente de cliente.
export default function QuestionsPage() {
  return <QuestionsPageClient />;
}