import { prisma } from "@/lib/db";

const PRO_PRICE_EUR = 29;

export default async function AdminDashboard() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, activeLast30d, payingUsers, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { updatedAt: { gt: thirtyDaysAgo } } }),
    prisma.user.count({ where: { plan: "pro" } }),
    prisma.user.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        email: true,
        plan: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const mrrEur = payingUsers * PRO_PRICE_EUR;
  const conversionPct =
    totalUsers === 0 ? 0 : +((payingUsers / totalUsers) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Live business KPIs.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total users" value={totalUsers.toLocaleString()} />
        <StatCard label="Active (30d)" value={activeLast30d.toLocaleString()} />
        <StatCard label="Paying users" value={payingUsers.toLocaleString()} />
        <StatCard
          label="MRR"
          value={`€${mrrEur.toLocaleString()}`}
          hint="Derived"
        />
        <StatCard
          label="Conversion"
          value={`${conversionPct}%`}
          hint="paying / total"
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="font-display text-sm font-semibold text-zinc-900">
            Recent users
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-2.5">Email</th>
                <th className="px-5 py-2.5">Plan</th>
                <th className="px-5 py-2.5">Role</th>
                <th className="px-5 py-2.5">Joined</th>
                <th className="px-5 py-2.5">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentUsers.map((u) => (
                <tr key={u.id} className="text-zinc-700">
                  <td className="px-5 py-2.5 font-medium text-zinc-900">{u.email}</td>
                  <td className="px-5 py-2.5 capitalize">{u.plan}</td>
                  <td className="px-5 py-2.5 capitalize">{u.role}</td>
                  <td className="px-5 py-2.5 text-zinc-500">
                    {u.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-5 py-2.5 text-zinc-500">
                    {u.updatedAt.toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold text-zinc-900">
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[10px] uppercase tracking-wide text-zinc-400">{hint}</div>}
    </div>
  );
}
