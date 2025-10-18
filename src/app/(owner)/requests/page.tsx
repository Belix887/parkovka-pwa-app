async function getRequests() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.NODE_ENV === 'production' ? 'https://parkovka-pwa-app.vercel.app' : 'http://localhost:3000');
    const res = await fetch(`${baseUrl}/api/owner/requests`, { cache: "no-store" });
    
    if (!res.ok) {
      console.error('Failed to fetch requests:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json();
    return data.requests as any[];
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
}

import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// Принудительно делаем страницу динамической
export const dynamic = 'force-dynamic';

export default async function OwnerRequestsPage() {
  const requests = await getRequests();
  
  return (
    <main className="container py-8">
      <MotionCard>
        <CardHeader
          title="Заявки на бронирование"
          subtitle="Управляйте заявками на ваши парковочные места"
          icon="📋"
        />
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Заявок пока нет
              </h3>
              <p className="text-[var(--text-secondary)]">
                Когда появятся заявки на ваши парковочные места, они отобразятся здесь
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <MotionCard key={request.id} className="p-6" hover>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {request.spotTitle || 'Парковочное место'}
                        </h3>
                        <Badge variant="default" size="sm">
                          {request.status || 'PENDING'}
                        </Badge>
                      </div>
                      <div className="text-[var(--text-secondary)] space-y-1">
                        <p>📅 {request.startAt} → {request.endAt}</p>
                        <p>💰 Сумма: {request.totalPrice || 'Не указана'}₽</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <form action={`/api/bookings/${request.id}/approve`} method="post">
                        <Button variant="primary" size="sm" icon="✅">
                          Принять
                        </Button>
                      </form>
                      <form action={`/api/bookings/${request.id}/decline`} method="post">
                        <Button variant="outline" size="sm" icon="❌">
                          Отклонить
                        </Button>
                      </form>
                    </div>
                  </div>
                </MotionCard>
              ))}
            </div>
          )}
        </CardContent>
      </MotionCard>
    </main>
  );
}


