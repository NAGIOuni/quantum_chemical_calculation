"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { JobBundle, Molecule, GJFUploadResult } from "@/types";
import Link from "next/link";

export default function BundleDetailPage() {
  const params = useParams();
  const bundleId = parseInt(params.id as string);

  const [bundle, setBundle] = useState<JobBundle | null>(null);
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadResults, setUploadResults] = useState<GJFUploadResult[]>([]);

  useEffect(() => {
    if (bundleId) {
      fetchBundleData();
    }
  }, [bundleId]);

  const fetchBundleData = async () => {
    try {
      const [bundleData, moleculesData] = await Promise.all([
        apiClient.getJobBundle(bundleId),
        apiClient.getMolecules(),
      ]);
      setBundle(bundleData);
      setMolecules(moleculesData.filter((m) => m.bundle_id === bundleId));
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const results = await apiClient.uploadGJFFiles(bundleId, files);
      setUploadResults(results);
      fetchBundleData(); // データを再取得
    } catch (error) {
      console.error("ファイルアップロードに失敗しました:", error);
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

  if (!bundle) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center">
            <p className="text-red-500">バンドルが見つかりません</p>
            <Link
              href="/bundles"
              className="text-indigo-600 hover:text-indigo-500"
            >
              バンドル一覧に戻る
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {bundle.name}
              </h1>
              <p className="text-sm text-gray-500">
                ID: {bundle.id} | 作成日:{" "}
                {new Date(bundle.created_at).toLocaleString("ja-JP")}
              </p>
            </div>
            <Link
              href="/bundles"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              戻る
            </Link>
          </div>

          {/* GJFファイルアップロード */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                GJFファイルアップロード
              </h3>
              <input
                type="file"
                multiple
                accept=".gjf"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          {/* アップロード結果 */}
          {uploadResults.length > 0 && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  アップロード結果
                </h3>
                <ul className="space-y-2">
                  {uploadResults.map((result, index) => (
                    <li
                      key={index}
                      className={`p-2 rounded ${
                        result.status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <span className="font-medium">{result.name}</span>:{" "}
                      {result.status}
                      {result.error_message && (
                        <span className="block text-sm">
                          {result.error_message}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 分子一覧 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                分子一覧 ({molecules.length}件)
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {molecules.map((molecule) => (
                <li key={molecule.id}>
                  <Link
                    href={`/molecules/${molecule.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {molecule.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="text-sm text-gray-500">
                            電荷: {molecule.charge}, 多重度:{" "}
                            {molecule.multiplicity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {molecules.length === 0 && (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-gray-500">分子がありません</p>
                <p className="text-sm text-gray-500 mt-1">
                  上記のフォームからGJFファイルをアップロードしてください
                </p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
