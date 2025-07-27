"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { Job } from "@/types";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await apiClient.getJobs();
      setJobs(data);
    } catch (error) {
      console.error("ジョブの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-blue-600 bg-blue-100";
      case "done":
        return "text-green-600 bg-green-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "queued":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === "all") return true;
    return job.status === filter;
  });

  const handleCancelJob = async (jobId: number) => {
    if (confirm("このジョブをキャンセルしますか？")) {
      try {
        await apiClient.cancelJob(jobId);
        fetchJobs();
      } catch (error) {
        console.error("ジョブのキャンセルに失敗しました:", error);
        alert("ジョブのキャンセルに失敗しました");
      }
    }
  };

  const handleRelaunchJob = async (jobId: number) => {
    if (confirm("このジョブを再投入しますか？")) {
      try {
        await apiClient.relaunchJob(jobId);
        fetchJobs();
      } catch (error) {
        console.error("ジョブの再投入に失敗しました:", error);
        alert("ジョブの再投入に失敗しました");
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
            <h1 className="text-3xl font-bold text-gray-900">ジョブ管理</h1>
            <button
              onClick={fetchJobs}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              更新
            </button>
          </div>

          {/* フィルター */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                フィルター
              </h3>
              <div className="flex space-x-4">
                {["all", "queued", "running", "done", "error", "cancelled"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        filter === status
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {status === "all" ? "すべて" : status}
                      <span className="ml-1 text-xs">
                        (
                        {status === "all"
                          ? jobs.length
                          : jobs.filter((j) => j.status === status).length}
                        )
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* ジョブ一覧 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <li key={job.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="text-lg font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Job #{job.id}
                          </Link>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getJobStatusColor(
                              job.status
                            )}`}
                          >
                            {job.status}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            ジョブタイプ: {job.job_type} | 分子ID:{" "}
                            {job.molecule_id}
                          </p>
                          <p className="text-sm text-gray-500">
                            投入日時:{" "}
                            {new Date(job.submitted_at).toLocaleString("ja-JP")}
                          </p>
                          {job.remote_job_id && (
                            <p className="text-sm text-gray-500">
                              リモートジョブID: {job.remote_job_id}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                        >
                          詳細
                        </Link>
                        <Link
                          href={`/jobs/${job.id}/log`}
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                        >
                          ログ
                        </Link>
                        {(job.status === "queued" ||
                          job.status === "running") && (
                          <button
                            onClick={() => handleCancelJob(job.id)}
                            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            キャンセル
                          </button>
                        )}
                        {(job.status === "error" ||
                          job.status === "cancelled") && (
                          <button
                            onClick={() => handleRelaunchJob(job.id)}
                            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            再投入
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {filteredJobs.length === 0 && (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-gray-500">
                  {filter === "all"
                    ? "ジョブがありません"
                    : `${filter} ステータスのジョブがありません`}
                </p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
