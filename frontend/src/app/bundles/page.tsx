"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { JobBundle, JobBundleCreate } from "@/types";
import Link from "next/link";

export default function BundlesPage() {
  const [bundles, setBundles] = useState<JobBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBundle, setNewBundle] = useState<JobBundleCreate>({
    name: "",
    calc_settings: {},
  });

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const data = await apiClient.getJobBundles();
      setBundles(data);
    } catch (error) {
      console.error("バンドルの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createJobBundle(newBundle);
      setNewBundle({ name: "", calc_settings: {} });
      setShowCreateForm(false);
      fetchBundles();
    } catch (error) {
      console.error("バンドルの作成に失敗しました:", error);
    }
  };

  const handleDeleteBundle = async (id: number) => {
    if (confirm("本当にこのバンドルを削除しますか？")) {
      try {
        await apiClient.deleteJobBundle(id);
        fetchBundles();
      } catch (error) {
        console.error("バンドルの削除に失敗しました:", error);
        alert("バンドルの削除に失敗しました");
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center h-64">
            <div>読み込み中...</div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">ジョブバンドル</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              新しいバンドルを作成
            </button>
          </div>

          {/* 作成フォーム */}
          {showCreateForm && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  新しいジョブバンドルを作成
                </h3>
                <form onSubmit={handleCreateBundle} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      バンドル名
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={newBundle.name}
                      onChange={(e) =>
                        setNewBundle({ ...newBundle, name: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                    >
                      作成
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* バンドル一覧 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {bundles.map((bundle) => (
                <li key={bundle.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/bundles/${bundle.id}`}
                          className="text-lg font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          {bundle.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          ID: {bundle.id} | 作成日:{" "}
                          {new Date(bundle.created_at).toLocaleString("ja-JP")}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/bundles/${bundle.id}`}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                        >
                          詳細
                        </Link>
                        <button
                          onClick={() => handleDeleteBundle(bundle.id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {bundles.length === 0 && (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-gray-500">
                  ジョブバンドルがありません
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  新しいバンドルを作成
                </button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
