"use client";

import { useSession, signOut } from "next-auth/react";

export default function AccountPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Account</h1>

      {/* User info */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-300 overflow-hidden">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-600">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {session?.user?.name || "User"}
            </div>
            <div className="text-xs text-gray-500">{session?.user?.email}</div>
          </div>
        </div>
      </div>

      {/* Plan status */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Plan</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            Free
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Posts this month</span>
          <span className="font-medium text-gray-900">&mdash; / 5</span>
        </div>
        <button className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Upgrade to Pro &mdash; &euro;29/mo
        </button>
        <p className="text-center text-xs text-gray-500">
          Unlimited posts, priority speed
        </p>
      </div>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
