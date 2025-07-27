"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold">
                Chemical Jobs
              </Link>
              <div className="flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900"
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/bundles"
                  className="text-gray-700 hover:text-gray-900"
                >
                  ジョブバンドル
                </Link>
                <Link
                  href="/molecules"
                  className="text-gray-700 hover:text-gray-900"
                >
                  分子
                </Link>
                <Link
                  href="/jobs"
                  className="text-gray-700 hover:text-gray-900"
                >
                  ジョブ
                </Link>
                <Link
                  href="/credentials"
                  className="text-gray-700 hover:text-gray-900"
                >
                  サーバー設定
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.username}</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4">{children}</main>
    </div>
  );
}
