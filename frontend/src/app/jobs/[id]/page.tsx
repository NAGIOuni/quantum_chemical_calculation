"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { Job, Molecule } from "@/types";
import Link from "next/link";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = parseInt(params.id as string);

  const [job, setJob] = useState<Job | null>(null);
  const [molecule, setMolecule] = useState<Molecule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);

  const fetchJobData = async () => {
    try {
      const jobData = await apiClient.getJob(jobId);
      setJob(jobData);

      if (jobData.molecule_id) {
        const moleculeData = await apiClient.getMolecule(jobData.molecule_id);
        setMolecule(moleculeData);
      }
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
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

  const handleCancelJob = async () => {
    if (confirm("このジョブをキャンセルしますか？")) {
      try {
        await apiClient.cancelJob(jobId);
        fetchJobData();
      } catch (error) {
        console.error("ジョブのキャンセルに失敗しました:", error);
        alert("ジョブのキャンセルに失敗しました");
      }
    }
  };

  const handleRelaunchJob = async () => {
    if (confirm("このジョブを再投入しますか？")) {
      try {
        await apiClient.relaunchJob(jobId);
        fetchJobData();
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

  if (!job) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center">
            <p className="text-red-500">ジョブが見つかりません</p>
            <Link
              href="/jobs"
              className="text-indigo-600 hover:text-indigo-500"
            >
              ジョブ一覧に戻る
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
                Job #{job.id}
              </h1>
              <div className="mt-2">
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getJobStatusColor(
                    job.status
                  )}`}
                >
                  {job.status}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                href="/jobs"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                戻る
              </Link>
              <Link
                href={`/jobs/${job.id}/log`}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                ログを見る
              </Link>
            </div>
          </div>

          {/* ジョブ情報 */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                ジョブ情報
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    ジョブID
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{job.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    ジョブタイプ
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{job.job_type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    ステータス
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{job.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    投入日時
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(job.submitted_at).toLocaleString("ja-JP")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">分子ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {molecule ? (
                      <Link
                        href={`/molecules/${job.molecule_id}`}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        {job.molecule_id} ({molecule.name})
                      </Link>
                    ) : (
                      job.molecule_id
                    )}
                  </dd>
                </div>
                {job.remote_job_id && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      リモートジョブID
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.remote_job_id}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">GJFパス</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {job.gjf_path}
                  </dd>
                </div>
                {job.log_path && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      ログパス
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">
                      {job.log_path}
                    </dd>
                  </div>
                )}
                {job.parent_job_id && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      親ジョブID
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <Link
                        href={`/jobs/${job.parent_job_id}`}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        {job.parent_job_id}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* 分子情報 */}
          {molecule && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  分子情報
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      分子名
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {molecule.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">電荷</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {molecule.charge}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      多重度
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {molecule.multiplicity}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      構造 (XYZ)
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                        {molecule.structure_xyz}
                      </pre>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* アクション */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                アクション
              </h3>
              <div className="flex space-x-3">
                {(job.status === "queued" || job.status === "running") && (
                  <button
                    onClick={handleCancelJob}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                  >
                    ジョブをキャンセル
                  </button>
                )}
                {(job.status === "error" || job.status === "cancelled") && (
                  <button
                    onClick={handleRelaunchJob}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    ジョブを再投入
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
