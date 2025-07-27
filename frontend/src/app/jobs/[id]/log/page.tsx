"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { JobLog } from "@/types";
import Link from "next/link";

export default function JobLogPage() {
  const params = useParams();
  const jobId = parseInt(params.id as string);

  const [jobLog, setJobLog] = useState<JobLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobLog();
    }
  }, [jobId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchJobLog, 5000); // 5秒ごとに更新
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, jobId]);

  const fetchJobLog = async () => {
    try {
      const data = await apiClient.getJobLog(jobId);
      setJobLog(data);
    } catch (error) {
      console.error("ログの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case "R":
        return "text-blue-600 bg-blue-100";
      case "Q":
        return "text-yellow-600 bg-yellow-100";
      case "C":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSystemStatusText = (status: string) => {
    switch (status) {
      case "R":
        return "Running";
      case "Q":
        return "Queued";
      case "C":
        return "Completed";
      default:
        return "Unknown";
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

  if (!jobLog) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center">
            <p className="text-red-500">ログが見つかりません</p>
            <Link
              href={`/jobs/${jobId}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              ジョブ詳細に戻る
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
                Job #{jobLog.job_id} ログ
              </h1>
              {jobLog.remote_job_id && (
                <p className="text-sm text-gray-500">
                  リモートジョブID: {jobLog.remote_job_id}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`font-bold py-2 px-4 rounded ${
                  autoRefresh
                    ? "bg-red-500 hover:bg-red-700 text-white"
                    : "bg-green-500 hover:bg-green-700 text-white"
                }`}
              >
                {autoRefresh ? "自動更新停止" : "自動更新開始"}
              </button>
              <button
                onClick={fetchJobLog}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                更新
              </button>
              <Link
                href={`/jobs/${jobId}`}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                戻る
              </Link>
            </div>
          </div>

          {/* ステータス情報 */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                ステータス情報
              </h3>
              <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    システムステータス
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSystemStatusColor(
                        jobLog.system_status
                      )}`}
                    >
                      {getSystemStatusText(jobLog.system_status)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    計算完了
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        jobLog.is_complete
                          ? "text-green-600 bg-green-100"
                          : "text-yellow-600 bg-yellow-100"
                      }`}
                    >
                      {jobLog.is_complete ? "完了" : "実行中"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    自動更新
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        autoRefresh
                          ? "text-green-600 bg-green-100"
                          : "text-gray-600 bg-gray-100"
                      }`}
                    >
                      {autoRefresh ? "ON" : "OFF"}
                    </span>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* ログ内容 */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  ログ内容 (末尾30行)
                </h3>
                <div className="text-sm text-gray-500">
                  最終更新: {new Date().toLocaleString("ja-JP")}
                </div>
              </div>
              <div className="bg-black text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {jobLog.log_content || "ログが取得できませんでした"}
                </pre>
              </div>
            </div>
          </div>

          {/* 計算状況の詳細 */}
          {jobLog.is_complete && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  計算結果
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {jobLog.log_content.includes("Normal termination") ? (
                    <div className="flex items-center text-green-600">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      計算が正常に終了しました (Normal termination)
                    </div>
                  ) : jobLog.log_content.includes("Error termination") ? (
                    <div className="flex items-center text-red-600">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      計算がエラーで終了しました (Error termination)
                    </div>
                  ) : (
                    <div className="flex items-center text-blue-600">
                      <svg
                        className="w-5 h-5 mr-2 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      計算実行中...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
