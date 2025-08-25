import { useEffect, useState } from 'react';
import { getAdminStats } from '@/services/admin';
import { errorHandler } from '@/utils';

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res?.data || res))
      .catch((e) => errorHandler(e, 'Failed to load dashboard'));
  }, []);

  if (!stats) return <div className="p-4">...</div>;

  return (
    <section className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(stats).map(([k, v]) => (
        <div key={k} className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title capitalize">{k}</h3>
            <p className="text-3xl font-bold">{v}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
export default Dashboard;
