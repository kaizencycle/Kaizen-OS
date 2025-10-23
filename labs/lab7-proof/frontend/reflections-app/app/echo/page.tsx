import EchoStatusPanel from '@/components/EchoStatusPanel';

export default function EchoPage() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Echo Pulse — System Health</h1>
      <EchoStatusPanel endpoint="/api/echo/latest" />
    </main>
  );
}
