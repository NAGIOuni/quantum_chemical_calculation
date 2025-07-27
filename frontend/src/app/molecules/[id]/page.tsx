'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { Molecule, Job, JobBundle, JobCreate } from '@/types';
import Link from 'next/link';

export default function MoleculeDetailPage() {
  const params = useParams();
  const moleculeId = parseInt(params.id as string);
  
  const [molecule, setMolecule] = useState<Molecule | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bundle, setBundle] = useState<JobBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [newJob, setNewJob] = useState<JobCreate>({
    molecule_id: moleculeId,
    gjf_path: '',
    job_type: 'SP',
  });

  useEffect(() => {
    if (moleculeId) {
      fetchMoleculeData();
    }
  }, [moleculeId]);

  const fetchMoleculeData = async () => {
    try {
      const [moleculeData, allJobs] = await Promise.all([
        apiClient.getMolecule(moleculeId),
        apiClient.getJobs(),
      ]);
      setMolecule(moleculeData);
      setJobs(allJobs.filter(job => job.molecule_id === moleculeId));
      
      if (moleculeData.bundle_id) {
        const bundleData = await apiClient.getJobBundle(moleculeData.bundle_id);
        setBundle(bundleData);
      }
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createJob(newJob);
      setNewJob({
        molecule_id: moleculeId,
        gjf_path: '',
        job_type: 'SP',
      });
      setShowJobForm(false);
      fetchMoleculeData();
    } catch (error) {
      console.error('ジョブの作成に失敗しました:', error);
      alert('ジョブの作成に失敗しました');
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'done':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'queued':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
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

  if (!molecule) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center">
            <p className="text-red-500">分子が見つかりません</p>
            <Link href="/molecules" className="text-indigo-600 hover:text-indigo-500">
              分子一覧に戻る
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
              <h1 className="text-3xl font-bold text-gray-900">{molecule.name}</h1>
              {bundle && (
                <p className="text-sm text-gray-500">
                  バンドル: {bundle.name}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowJobForm(true)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                新しいジョブ
              </button>
              <Link
                href="/molecules"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                戻る
              </Link>
            </div>
          </div>

          {/* ジョブ作成フォーム */}
          {showJobForm && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  新しいジョブを作成
                </h3>
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div>
                    <label htmlFor="job_type" className="block text-sm font-medium text-gray-700">
                      ジョブタイプ
                    </label>
                    <select
                      id="job_type"
                      value={newJob.job_type}
                      onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="/path/to/molecule.gjf"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                    >
                      ジョブを作成
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowJobForm(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 分子情報 */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                分子情報
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">分子ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{molecule.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">分子名</dt>
                  <dd className="mt-1 text-sm text-gray-900">{molecule.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">電荷</dt>
                  <dd className="mt-1 text-sm text-gray-900">{molecule.charge}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">多重度</dt>
                  <dd className="mt-1 text-sm text-gray-900">{molecule.multiplicity}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">バンドルID</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {bundle ? (
                      <Link
                        href={`/bundles/${molecule.bundle_id}`}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        {molecule.bundle_id} ({bundle.name})
                      </Link>
                    ) : (
                      molecule.bundle_id
                    )}
                  </dd>
                </div>
                {molecule.latest_job_id && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">最新ジョブID</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <Link
                        href={`/jobs/${molecule.latest_job_id}`}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        {molecule.latest_job_id}
                      </Link>
                    </dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">構造 (XYZ)</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
                      {molecule.structure_xyz}
                    </pre>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* ジョブ履歴 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                ジョブ履歴 ({jobs.length}件)
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <p className="text-sm font-medium text-indigo-600">
                              Job #{job.id} - {job.job_type}
                            </p>
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
                              投入日時: {new Date(job.submitted_at).toLocaleString('ja-JP')}
                            </p>
                            {job.remote_job_id && (
                              <p className="text-sm text-gray-500">
                                リモートジョブID: {job.remote_job_id}
                              </p>
                            )}
                            {job.parent_job_id && (
                              <p className="text-sm text-gray-500">
                                親ジョブID: {job.parent_job_id}
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
            {jobs.length === 0 && (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-gray-500">この分子のジョブはまだありません</p>
                <button
                  onClick={() => setShowJobForm(true)}
                  className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  新しいジョブを作成
                </button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="SP">Single Point (SP)</option>
                      <option value="Opt">Optimization (Opt)</option>
                      <option value="Freq">Frequency (Freq)</option>
                      <option value="TD">Time-Dependent (TD)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="gjf_path" className="block text-sm font-medium text-gray-700">
                      GJFファイルパス
                    </label>
                    <input
                      type="text"
                      id="gjf_path"
                      required
                      value={newJob.gjf_path}
                      onChange={(e) => setNewJob({ ...newJob, gjf_path: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus: