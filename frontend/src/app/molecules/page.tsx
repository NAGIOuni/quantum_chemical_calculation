"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { Molecule, JobBundle } from "@/types";
import Link from "next/link";

export default function MoleculesPage() {
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [bundles, setBundles] = useState<JobBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | "all">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [moleculesData, bundlesData] = await Promise.all([
        apiClient.getMolecules(),
        apiClient.getJobBundles(),
      ]);
      setMolecules(moleculesData);
      setBundles(bundlesData);
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMolecules = molecules.filter((molecule) => {
    if (filter === "all") return true;
    return molecule.bundle_id === filter;
  });

  const getBundleName = (bundleId: number) => {
    const bundle = bundles.find((b) => b.id === bundleId);
    return bundle ? bundle.name : `Bundle ${bundleId}`;
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
            <h1 className="text-3xl font-bold text-gray-900">分子管理</h1>
            <Link
              href="/bundles"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              バンドル管理
            </Link>
          </div>

          {/* フィルター */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                バンドル別フィルター
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    filter === "all"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  すべて ({molecules.length})
                </button>
                {bundles.map((bundle) => (
                  <button
                    key={bundle.id}
                    onClick={() => setFilter(bundle.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      filter === bundle.id
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {bundle.name} (
                    {molecules.filter((m) => m.bundle_id === bundle.id).length})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 分子一覧 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredMolecules.map((molecule) => (
                <li key={molecule.id}>
                  <Link
                    href={`/molecules/${molecule.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-medium text-indigo-600">
                              {molecule.name}
                            </h4>
                            <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                              {getBundleName(molecule.bundle_id)}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              電荷: {molecule.charge} | 多重度:{" "}
                              {molecule.multiplicity}
                            </p>
                            <p className="text-sm text-gray-500">
                              分子ID: {molecule.id} | バンドルID:{" "}
                              {molecule.bundle_id}
                            </p>
                            {molecule.latest_job_id && (
                              <p className="text-sm text-gray-500">
                                最新ジョブID: {molecule.latest_job_id}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {filteredMolecules.length === 0 && (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-gray-500">
                  {filter === "all"
                    ? "分子がありません"
                    : `選択されたバンドルに分子がありません`}
                </p>
                <Link
                  href="/bundles"
                  className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  バンドル管理でGJFファイルをアップロード
                </Link>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
