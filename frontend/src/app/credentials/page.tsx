"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import {
  ServerCredential,
  ServerCredentialCreate,
  AuthMethod,
} from "@/types/credential";

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<ServerCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCredential, setNewCredential] = useState<ServerCredentialCreate>({
    host: "",
    port: 22,
    username: "",
    auth_method: AuthMethod.PASSWORD,
    password: "",
    ssh_key: "",
  });
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const data = await apiClient.getServerCredentials();
      setCredentials(data);
    } catch (error) {
      console.error("認証情報の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createServerCredential(newCredential);
      setNewCredential({
        host: "",
        port: 22,
        username: "",
        auth_method: AuthMethod.PASSWORD,
        password: "",
        ssh_key: "",
      });
      setShowCreateForm(false);
      fetchCredentials();
    } catch (error) {
      console.error("認証情報の作成に失敗しました:", error);
      alert("認証情報の作成に失敗しました");
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestResult("テスト中...");
      const result = await apiClient.testConnection(newCredential);
      setTestResult(result.result);
    } catch (error) {
      setTestResult(
        `エラー: ${
          error instanceof Error ? error.message : "接続に失敗しました"
        }`
      );
    }
  };

  const handleDeleteCredential = async (id: number) => {
    if (confirm("本当にこの認証情報を削除しますか？")) {
      try {
        await apiClient.deleteServerCredential(id);
        fetchCredentials();
      } catch (error) {
        console.error("認証情報の削除に失敗しました:", error);
        alert("認証情報の削除に失敗しました");
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
            <h1 className="text-3xl font-bold text-gray-900">サーバー設定</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              新しい認証情報を追加
            </button>
          </div>

          {/* 作成フォーム */}
          {showCreateForm && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  新しいサーバー認証情報
                </h3>
                <form onSubmit={handleCreateCredential} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="host"
                        className="block text-sm font-medium text-gray-700"
                      >
                        ホスト名
                      </label>
                      <input
                        type="text"
                        id="host"
                        required
                        value={newCredential.host}
                        onChange={(e) =>
                          setNewCredential({
                            ...newCredential,
                            host: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="example.com"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="port"
                        className="block text-sm font-medium text-gray-700"
                      >
                        ポート
                      </label>
                      <input
                        type="number"
                        id="port"
                        required
                        value={newCredential.port}
                        onChange={(e) =>
                          setNewCredential({
                            ...newCredential,
                            port: parseInt(e.target.value),
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ユーザー名
                    </label>
                    <input
                      type="text"
                      id="username"
                      required
                      value={newCredential.username}
                      onChange={(e) =>
                        setNewCredential({
                          ...newCredential,
                          username: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="auth_method"
                      className="block text-sm font-medium text-gray-700"
                    >
                      認証方式
                    </label>
                    <select
                      id="auth_method"
                      value={newCredential.auth_method}
                      onChange={(e) =>
                        setNewCredential({
                          ...newCredential,
                          auth_method: e.target.value as AuthMethod,
                          password: "",
                          ssh_key: "",
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={AuthMethod.PASSWORD}>パスワード</option>
                      <option value={AuthMethod.SSH_KEY}>SSH鍵</option>
                    </select>
                  </div>

                  {newCredential.auth_method === AuthMethod.PASSWORD ? (
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        パスワード
                      </label>
                      <input
                        type="password"
                        id="password"
                        required
                        value={newCredential.password}
                        onChange={(e) =>
                          setNewCredential({
                            ...newCredential,
                            password: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="ssh_key"
                        className="block text-sm font-medium text-gray-700"
                      >
                        SSH秘密鍵
                      </label>
                      <textarea
                        id="ssh_key"
                        required
                        rows={8}
                        value={newCredential.ssh_key}
                        onChange={(e) =>
                          setNewCredential({
                            ...newCredential,
                            ssh_key: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"
                      />
                    </div>
                  )}

                  {/* テスト結果 */}
                  {testResult && (
                    <div
                      className={`p-3 rounded ${
                        testResult.includes("成功")
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {testResult}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                    >
                      接続テスト
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setTestResult("");
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 認証情報一覧 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                登録済み認証情報
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {credentials.map((credential) => (
                <li key={credential.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {credential.host}:{credential.port}
                          </h4>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              credential.auth_method === AuthMethod.PASSWORD
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {credential.auth_method === AuthMethod.PASSWORD
                              ? "パスワード"
                              : "SSH鍵"}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            ユーザー名: {credential.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            登録日:{" "}
                            {new Date(credential.created_at).toLocaleString(
                              "ja-JP"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteCredential(credential.id)}
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
            {credentials.length === 0 && (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-gray-500">
                  認証情報が登録されていません
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  新しい認証情報を追加
                </button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
