const users = [
  { name: "Sofia Admin", role: "Administrator", state: "Active" },
  { name: "Jordan Guest", role: "Customer", state: "Active" },
  { name: "Support Agent", role: "Support", state: "Invited" },
] as const;

export default function AdminUsersPage() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
        User administration
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        Roles, staff access, and account states
      </h2>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950">
            {users.map((user) => (
              <tr key={user.name}>
                <td className="px-4 py-3 text-white">{user.name}</td>
                <td className="px-4 py-3 text-slate-300">{user.role}</td>
                <td className="px-4 py-3 text-cyan-300">{user.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
