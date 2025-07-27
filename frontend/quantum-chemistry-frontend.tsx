import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // トークンから現在のユーザー情報を取得
      fetchCurrentUser();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      logout();
    }
  };

  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch('/auth/login', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('ログインエラー:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return response.ok;
    } catch (error) {
      console.error('登録エラー:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// API Hook
const useApi = () => {
  const { token } = useAuth();
  
  const apiCall = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };
    
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  };

  return { apiCall };
};

// Layout Component
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return children;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: '250px', backgroundColor: '#f5f5f5', padding: '20px' }}>
        <h2>量子化学計算システム</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/dashboard">ダッシュボード</Link></li>
          <li><Link to="/profile">プロフィール</Link></li>
          <li><Link to="/credentials">認証情報</Link></li>
          <li><Link to="/bundles">ジョブバンドル</Link></li>
          <li><Link to="/molecules">分子</Link></li>
          <li><Link to="/jobs">ジョブ</Link></li>
          <li><button onClick={logout}>ログアウト</button></li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: '20px' }}>
        {children}
      </main>
    </div>
  );
};

// Login Page
const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('ログインに失敗しました');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>ログイン</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ユーザー名:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>パスワード:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">ログイン</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <p><Link to="/register">新規登録</Link></p>
    </div>
  );
};

// Register Page
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    local_base_dir: '',
    remote_base_dir: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/login');
    } else {
      setError('登録に失敗しました');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>新規登録</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ユーザー名:</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
        </div>
        <div>
          <label>パスワード:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <div>
          <label>ローカルベースディレクトリ:</label>
          <input
            type="text"
            value={formData.local_base_dir}
            onChange={(e) => setFormData({...formData, local_base_dir: e.target.value})}
            required
          />
        </div>
        <div>
          <label>リモートベースディレクトリ:</label>
          <input
            type="text"
            value={formData.remote_base_dir}
            onChange={(e) => setFormData({...formData, remote_base_dir: e.target.value})}
            required
          />
        </div>
        <button type="submit">登録</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <p><Link to="/login">ログインページに戻る</Link></p>
    </div>
  );
};

// Dashboard Page
const Dashboard = () => {
  const [stats, setStats] = useState({
    bundles: 0,
    molecules: 0,
    jobs: 0,
    runningJobs: 0
  });
  const { apiCall } = useApi();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bundles, molecules, jobs] = await Promise.all([
          apiCall('/bundles/'),
          apiCall('/molecules/'),
          apiCall('/jobs/')
        ]);
        
        setStats({
          bundles: bundles.length,
          molecules: molecules.length,
          jobs: jobs.length,
          runningJobs: jobs.filter(job => job.status === 'running').length
        });
      } catch (error) {
        console.error('統計データ取得エラー:', error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div>
      <h1>ダッシュボード</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '20px' }}>
          <h3>ジョブバンドル</h3>
          <p>{stats.bundles} 個</p>
          <Link to="/bundles">管理</Link>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px' }}>
          <h3>分子</h3>
          <p>{stats.molecules} 個</p>
          <Link to="/molecules">管理</Link>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px' }}>
          <h3>ジョブ</h3>
          <p>総数: {stats.jobs} 個</p>
          <p>実行中: {stats.runningJobs} 個</p>
          <Link to="/jobs">管理</Link>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px' }}>
          <h3>サーバー認証情報</h3>
          <Link to="/credentials">管理</Link>
        </div>
      </div>
    </div>
  );
};

// Profile Page
const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    local_base_dir: '',
    remote_base_dir: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const { apiCall } = useApi();

  useEffect(() => {
    if (user) {
      setFormData({
        local_base_dir: user.local_base_dir || '',
        remote_base_dir: user.remote_base_dir || ''
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      setIsEditing(false);
      alert('プロフィールを更新しました');
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました');
    }
  };

  if (!user) return <div>読み込み中...</div>;

  return (
    <div>
      <h1>プロフィール</h1>
      <div>
        <p><strong>ユーザー名:</strong> {user.username}</p>
        <p><strong>役割:</strong> {user.role}</p>
        <p><strong>登録日:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
      </div>
      
      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <div>
            <label>ローカルベースディレクトリ:</label>
            <input
              type="text"
              value={formData.local_base_dir}
              onChange={(e) => setFormData({...formData, local_base_dir: e.target.value})}
            />
          </div>
          <div>
            <label>リモートベースディレクトリ:</label>
            <input
              type="text"
              value={formData.remote_base_dir}
              onChange={(e) => setFormData({...formData, remote_base_dir: e.target.value})}
            />
          </div>
          <button type="submit">保存</button>
          <button type="button" onClick={() => setIsEditing(false)}>キャンセル</button>
        </form>
      ) : (
        <div>
          <p><strong>ローカルベースディレクトリ:</strong> {user.local_base_dir}</p>
          <p><strong>リモートベースディレクトリ:</strong> {user.remote_base_dir}</p>
          <button onClick={() => setIsEditing(true)}>編集</button>
        </div>
      )}
    </div>
  );
};

// Credentials Page
const CredentialsPage = () => {
  const [credentials, setCredentials] = useState([]);
  const { apiCall } = useApi();

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const data = await apiCall('/credentials/');
      setCredentials(data);
    } catch (error) {
      console.error('認証情報取得エラー:', error);
    }
  };

  const deleteCredential = async (id) => {
    if (!confirm('削除しますか？')) return;
    
    try {
      await apiCall(`/credentials/${id}`, { method: 'DELETE' });
      fetchCredentials();
    } catch (error) {
      console.error('削除エラー:', error);
    }
  };

  return (
    <div>
      <h1>サーバー認証情報</h1>
      <Link to="/credentials/new">新規作成</Link>
      
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>投入日時</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <Link to={`/jobs/${job.id}`}>{job.id}</Link>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{job.molecule_id}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{job.job_type}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px', color: getStatusColor(job.status) }}>
                {job.status}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {new Date(job.submitted_at).toLocaleString()}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <Link to={`/jobs/${job.id}/log`}>ログ</Link>
                {(job.status === 'queued' || job.status === 'running') && (
                  <button onClick={() => cancelJob(job.id)}>キャンセル</button>
                )}
                {(job.status === 'error' || job.status === 'cancelled') && (
                  <button onClick={() => relaunchJob(job.id)}>再投入</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Job Detail Page
const JobDetailPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const { apiCall } = useApi();

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const data = await apiCall(`/jobs/${id}`);
      setJob(data);
    } catch (error) {
      console.error('ジョブ取得エラー:', error);
    }
  };

  if (!job) return <div>読み込み中...</div>;

  return (
    <div>
      <h1>ジョブ詳細 (ID: {job.id})</h1>
      <div>
        <p><strong>分子ID:</strong> {job.molecule_id}</p>
        <p><strong>ジョブタイプ:</strong> {job.job_type}</p>
        <p><strong>ステータス:</strong> {job.status}</p>
        <p><strong>投入日時:</strong> {new Date(job.submitted_at).toLocaleString()}</p>
        <p><strong>GJFパス:</strong> {job.gjf_path}</p>
        <p><strong>ログパス:</strong> {job.log_path || 'N/A'}</p>
        <p><strong>リモートジョブID:</strong> {job.remote_job_id || 'N/A'}</p>
        <p><strong>親ジョブID:</strong> {job.parent_job_id || 'N/A'}</p>
      </div>
      <div>
        <Link to={`/jobs/${job.id}/log`}>ログを見る</Link>
        <Link to="/jobs">ジョブ一覧に戻る</Link>
      </div>
    </div>
  );
};

// Job Log Page
const JobLogPage = () => {
  const { id } = useParams();
  const [logData, setLogData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { apiCall } = useApi();

  const fetchLog = async () => {
    setIsLoading(true);
    try {
      const data = await apiCall(`/jobs/${id}/log`);
      setLogData(data);
    } catch (error) {
      console.error('ログ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLog();
    // 5秒おきに自動更新
    const interval = setInterval(fetchLog, 5000);
    return () => clearInterval(interval);
  }, [id]);

  return (
    <div>
      <h1>ジョブログ (ID: {id})</h1>
      <div>
        <button onClick={fetchLog} disabled={isLoading}>
          {isLoading ? '読み込み中...' : '更新'}
        </button>
        <Link to={`/jobs/${id}`}>ジョブ詳細に戻る</Link>
      </div>
      
      {logData && (
        <div>
          <div style={{ marginBottom: '10px' }}>
            <p><strong>完了状態:</strong> {logData.is_complete ? '完了' : '実行中'}</p>
            <p><strong>システムステータス:</strong> {logData.system_status}</p>
            <p><strong>リモートジョブID:</strong> {logData.remote_job_id}</p>
          </div>
          
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            height: '400px',
            overflow: 'auto',
            border: '1px solid #ccc'
          }}>
            {logData.log_content}
          </div>
        </div>
      )}
    </div>
  );
};

// Molecule Detail Page
const MoleculeDetailPage = () => {
  const { id } = useParams();
  const [molecule, setMolecule] = useState(null);
  const { apiCall } = useApi();

  useEffect(() => {
    fetchMolecule();
  }, [id]);

  const fetchMolecule = async () => {
    try {
      const data = await apiCall(`/molecules/${id}`);
      setMolecule(data);
    } catch (error) {
      console.error('分子取得エラー:', error);
    }
  };

  if (!molecule) return <div>読み込み中...</div>;

  return (
    <div>
      <h1>分子詳細: {molecule.name}</h1>
      <div>
        <p><strong>ID:</strong> {molecule.id}</p>
        <p><strong>電荷:</strong> {molecule.charge}</p>
        <p><strong>多重度:</strong> {molecule.multiplicity}</p>
        <p><strong>バンドルID:</strong> {molecule.bundle_id}</p>
        <p><strong>最新ジョブID:</strong> {molecule.latest_job_id || 'N/A'}</p>
      </div>
      
      <div>
        <h3>構造 (XYZ)</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          border: '1px solid #ccc',
          whiteSpace: 'pre-wrap'
        }}>
          {molecule.structure_xyz}
        </pre>
      </div>
      
      <div>
        <Link to={`/molecules/${molecule.id}/edit`}>編集</Link>
        <Link to="/molecules">分子一覧に戻る</Link>
      </div>
    </div>
  );
};

// Edit Molecule Page
const EditMoleculePage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    charge: 0,
    multiplicity: 1,
    structure_xyz: ''
  });
  const { apiCall } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMolecule();
  }, [id]);

  const fetchMolecule = async () => {
    try {
      const data = await apiCall(`/molecules/${id}`);
      setFormData({
        name: data.name,
        charge: data.charge,
        multiplicity: data.multiplicity,
        structure_xyz: data.structure_xyz
      });
    } catch (error) {
      console.error('分子取得エラー:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiCall(`/molecules/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      navigate(`/molecules/${id}`);
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました');
    }
  };

  return (
    <div>
      <h1>分子編集</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>名前:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <label>電荷:</label>
          <input
            type="number"
            value={formData.charge}
            onChange={(e) => setFormData({...formData, charge: parseInt(e.target.value)})}
            required
          />
        </div>
        <div>
          <label>多重度:</label>
          <input
            type="number"
            value={formData.multiplicity}
            onChange={(e) => setFormData({...formData, multiplicity: parseInt(e.target.value)})}
            required
            min="1"
          />
        </div>
        <div>
          <label>構造 (XYZ):</label>
          <textarea
            value={formData.structure_xyz}
            onChange={(e) => setFormData({...formData, structure_xyz: e.target.value})}
            rows={10}
            cols={50}
            required
          />
        </div>
        <div>
          <button type="submit">保存</button>
          <Link to={`/molecules/${id}`}>キャンセル</Link>
        </div>
      </form>
    </div>
  );
};

// Bundle Detail Page
const BundleDetailPage = () => {
  const { id } = useParams();
  const [bundle, setBundle] = useState(null);
  const [molecules, setMolecules] = useState([]);
  const { apiCall } = useApi();

  useEffect(() => {
    fetchBundle();
    fetchMolecules();
  }, [id]);

  const fetchBundle = async () => {
    try {
      const data = await apiCall(`/bundles/${id}`);
      setBundle(data);
    } catch (error) {
      console.error('バンドル取得エラー:', error);
    }
  };

  const fetchMolecules = async () => {
    try {
      const allMolecules = await apiCall('/molecules/');
      const bundleMolecules = allMolecules.filter(mol => mol.bundle_id === parseInt(id));
      setMolecules(bundleMolecules);
    } catch (error) {
      console.error('分子取得エラー:', error);
    }
  };

  if (!bundle) return <div>読み込み中...</div>;

  return (
    <div>
      <h1>バンドル詳細: {bundle.name}</h1>
      <div>
        <p><strong>ID:</strong> {bundle.id}</p>
        <p><strong>ユーザーID:</strong> {bundle.user_id}</p>
        <p><strong>作成日:</strong> {new Date(bundle.created_at).toLocaleDateString()}</p>
        <p><strong>計算設定:</strong></p>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px' }}>
          {JSON.stringify(bundle.calc_settings, null, 2)}
        </pre>
      </div>

      <div>
        <h3>分子一覧 ({molecules.length}個)</h3>
        {molecules.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>名前</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>電荷</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>多重度</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {molecules.map(mol => (
                <tr key={mol.id}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <Link to={`/molecules/${mol.id}`}>{mol.name}</Link>
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{mol.charge}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{mol.multiplicity}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <Link to={`/molecules/${mol.id}/edit`}>編集</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>分子が登録されていません</p>
        )}
      </div>

      <div>
        <Link to={`/bundles/${id}/edit`}>編集</Link>
        <Link to={`/bundles/${id}/upload`}>GJFアップロード</Link>
        <Link to="/bundles">バンドル一覧に戻る</Link>
      </div>
    </div>
  );
};

// GJF Upload Page
const GJFUploadPage = () => {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [uploadResults, setUploadResults] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { apiCall } = useApi();

  const handleFileSelect = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('ファイルを選択してください');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch(`/bundles/${id}/upload-gjf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const results = await response.json();
        setUploadResults(results);
      } else {
        alert('アップロードに失敗しました');
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h1>GJFファイルアップロード</h1>
      
      <div>
        <input
          type="file"
          multiple
          accept=".gjf,.com"
          onChange={handleFileSelect}
        />
        <button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? 'アップロード中...' : 'アップロード'}
        </button>
      </div>

      {files.length > 0 && (
        <div>
          <h3>選択されたファイル</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      {uploadResults.length > 0 && (
        <div>
          <h3>アップロード結果</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>ファイル名</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>ステータス</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>電荷</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>多重度</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>エラー</th>
              </tr>
            </thead>
            <tbody>
              {uploadResults.map((result, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{result.name}</td>
                  <td style={{ 
                    border: '1px solid #ccc', 
                    padding: '8px',
                    color: result.status === 'success' ? 'green' : 'red'
                  }}>
                    {result.status}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    {result.charge || 'N/A'}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    {result.multiplicity || 'N/A'}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    {result.error_message || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <Link to={`/bundles/${id}`}>バンドル詳細に戻る</Link>
      </div>
    </div>
  );
};

// Edit Bundle Page
const EditBundlePage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    calc_settings: '{}'
  });
  const { apiCall } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBundle();
  }, [id]);

  const fetchBundle = async () => {
    try {
      const data = await apiCall(`/bundles/${id}`);
      setFormData({
        name: data.name,
        calc_settings: JSON.stringify(data.calc_settings, null, 2)
      });
    } catch (error) {
      console.error('バンドル取得エラー:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        calc_settings: JSON.parse(formData.calc_settings)
      };
      await apiCall(`/bundles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      navigate(`/bundles/${id}`);
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました');
    }
  };

  return (
    <div>
      <h1>バンドル編集</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>名前:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <label>計算設定 (JSON):</label>
          <textarea
            value={formData.calc_settings}
            onChange={(e) => setFormData({...formData, calc_settings: e.target.value})}
            rows={10}
            cols={50}
          />
        </div>
        <div>
          <button type="submit">保存</button>
          <Link to={`/bundles/${id}`}>キャンセル</Link>
        </div>
      </form>
    </div>
  );
};

// Edit Credential Page
const EditCredentialPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    host: '',
    port: 22,
    username: '',
    auth_method: 'password',
    password: '',
    ssh_key: ''
  });
  const { apiCall } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCredential();
  }, [id]);

  const fetchCredential = async () => {
    try {
      const data = await apiCall(`/credentials/${id}`);
      setFormData({
        host: data.host,
        port: data.port,
        username: data.username,
        auth_method: data.auth_method,
        password: '',
        ssh_key: ''
      });
    } catch (error) {
      console.error('認証情報取得エラー:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiCall(`/credentials/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      navigate('/credentials');
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました');
    }
  };

  const testConnection = async () => {
    try {
      await apiCall('/credentials/test-connection', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('接続テスト成功');
    } catch (error) {
      console.error('接続テストエラー:', error);
      alert('接続テスト失敗');
    }
  };

  return (
    <div>
      <h1>認証情報編集</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ホスト:</label>
          <input
            type="text"
            value={formData.host}
            onChange={(e) => setFormData({...formData, host: e.target.value})}
            required
          />
        </div>
        <div>
          <label>ポート:</label>
          <input
            type="number"
            value={formData.port}
            onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
            required
          />
        </div>
        <div>
          <label>ユーザー名:</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
        </div>
        <div>
          <label>認証方式:</label>
          <select
            value={formData.auth_method}
            onChange={(e) => setFormData({...formData, auth_method: e.target.value})}
          >
            <option value="password">パスワード</option>
            <option value="ssh_key">SSH鍵</option>
          </select>
        </div>
        
        {formData.auth_method === 'password' ? (
          <div>
            <label>新しいパスワード:</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        ) : (
          <div>
            <label>新しいSSH秘密鍵:</label>
            <textarea
              value={formData.ssh_key}
              onChange={(e) => setFormData({...formData, ssh_key: e.target.value})}
              rows={10}
              cols={50}
            />
          </div>
        )}
        
        <div>
          <button type="button" onClick={testConnection}>接続テスト</button>
          <button type="submit">保存</button>
          <Link to="/credentials">キャンセル</Link>
        </div>
      </form>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>エラーが発生しました</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            ページを再読み込み
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px' 
  }}>
    <div>読み込み中...</div>
  </div>
);

// Notification Component
const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 1000 
      }}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            style={{
              backgroundColor: notification.type === 'error' ? '#f44336' : 
                             notification.type === 'success' ? '#4caf50' : '#2196f3',
              color: 'white',
              padding: '12px 16px',
              marginBottom: '8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => removeNotification(notification.id)}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

const useNotification = () => useContext(NotificationContext);

// Search and Filter Component
const SearchAndFilter = ({ onSearch, onFilter, filters = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilter = (e) => {
    const value = e.target.value;
    setSelectedFilter(value);
    onFilter(value);
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '10px', 
      marginBottom: '20px',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px'
    }}>
      <input
        type="text"
        placeholder="検索..."
        value={searchTerm}
        onChange={handleSearch}
        style={{ padding: '8px', flex: 1 }}
      />
      {filters.length > 0 && (
        <select value={selectedFilter} onChange={handleFilter}>
          <option value="">すべて</option>
          {filters.map(filter => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      gap: '5px', 
      marginTop: '20px' 
    }}>
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        前へ
      </button>
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            backgroundColor: page === currentPage ? '#2196f3' : 'white',
            color: page === currentPage ? 'white' : 'black',
            border: '1px solid #ccc',
            padding: '8px 12px'
          }}
        >
          {page}
        </button>
      ))}
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        次へ
      </button>
    </div>
  );
};

// Enhanced Jobs Page with Search and Filter
const EnhancedJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { apiCall } = useApi();
  const { addNotification } = useNotification();
  
  const jobsPerPage = 10;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await apiCall('/jobs/');
      setJobs(data);
      setFilteredJobs(data);
      addNotification('ジョブ一覧を更新しました', 'success');
    } catch (error) {
      console.error('ジョブ取得エラー:', error);
      addNotification('ジョブの取得に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = jobs.filter(job => 
      job.id.toString().includes(searchTerm) ||
      job.job_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const handleFilter = (status) => {
    if (!status) {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job => job.status === status);
      setFilteredJobs(filtered);
    }
    setCurrentPage(1);
  };

  const cancelJob = async (id) => {
    if (!confirm('キャンセルしますか？')) return;
    
    try {
      await apiCall(`/jobs/${id}/cancel`, { method: 'POST' });
      fetchJobs();
      addNotification('ジョブをキャンセルしました', 'success');
    } catch (error) {
      console.error('キャンセルエラー:', error);
      addNotification('キャンセルに失敗しました', 'error');
    }
  };

  const relaunchJob = async (id) => {
    if (!confirm('再投入しますか？')) return;
    
    try {
      await apiCall(`/jobs/${id}/relaunch`, { method: 'POST' });
      fetchJobs();
      addNotification('ジョブを再投入しました', 'success');
    } catch (error) {
      console.error('再投入エラー:', error);
      addNotification('再投入に失敗しました', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'blue';
      case 'done': return 'green';
      case 'error': return 'red';
      case 'cancelled': return 'orange';
      default: return 'gray';
    }
  };

  const statusFilters = [
    { value: 'queued', label: 'キューイング中' },
    { value: 'running', label: '実行中' },
    { value: 'done', label: '完了' },
    { value: 'error', label: 'エラー' },
    { value: 'cancelled', label: 'キャンセル済み' }
  ];

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>ジョブ管理</h1>
        <button onClick={fetchJobs}>更新</button>
      </div>
      
      <SearchAndFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        filters={statusFilters}
      />
      
      <div>
        <p>総ジョブ数: {jobs.length} | 表示中: {filteredJobs.length}</p>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>分子ID</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>ジョブタイプ</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>ステータス</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>投入日時</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {currentJobs.map(job => (
            <tr key={job.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <Link to={`/jobs/${job.id}`}>{job.id}</Link>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{job.molecule_id}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{job.job_type}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px', color: getStatusColor(job.status) }}>
                {job.status}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {new Date(job.submitted_at).toLocaleString()}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <Link to={`/jobs/${job.id}/log`}>ログ</Link>
                  {(job.status === 'queued' || job.status === 'running') && (
                    <button onClick={() => cancelJob(job.id)}>キャンセル</button>
                  )}
                  {(job.status === 'error' || job.status === 'cancelled') && (
                    <button onClick={() => relaunchJob(job.id)}>再投入</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute><ProfilePage /></ProtectedRoute>
                } />
                
                <Route path="/credentials" element={
                  <ProtectedRoute><CredentialsPage /></ProtectedRoute>
                } />
                <Route path="/credentials/new" element={
                  <ProtectedRoute><NewCredentialPage /></ProtectedRoute>
                } />
                <Route path="/credentials/:id/edit" element={
                  <ProtectedRoute><EditCredentialPage /></ProtectedRoute>
                } />
                
                <Route path="/bundles" element={
                  <ProtectedRoute><JobBundlesPage /></ProtectedRoute>
                } />
                <Route path="/bundles/new" element={
                  <ProtectedRoute><NewBundlePage /></ProtectedRoute>
                } />
                <Route path="/bundles/:id" element={
                  <ProtectedRoute><BundleDetailPage /></ProtectedRoute>
                } />
                <Route path="/bundles/:id/edit" element={
                  <ProtectedRoute><EditBundlePage /></ProtectedRoute>
                } />
                <Route path="/bundles/:id/upload" element={
                  <ProtectedRoute><GJFUploadPage /></ProtectedRoute>
                } />
                
                <Route path="/molecules" element={
                  <ProtectedRoute><MoleculesPage /></ProtectedRoute>
                } />
                <Route path="/molecules/:id" element={
                  <ProtectedRoute><MoleculeDetailPage /></ProtectedRoute>
                } />
                <Route path="/molecules/:id/edit" element={
                  <ProtectedRoute><EditMoleculePage /></ProtectedRoute>
                } />
                
                <Route path="/jobs" element={
                  <ProtectedRoute><EnhancedJobsPage /></ProtectedRoute>
                } />
                <Route path="/jobs/:id" element={
                  <ProtectedRoute><JobDetailPage /></ProtectedRoute>
                } />
                <Route path="/jobs/:id/log" element={
                  <ProtectedRoute><JobLogPage /></ProtectedRoute>
                } />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default App;px' }}>ホスト</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>ポート</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>ユーザー名</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>認証方式</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>作成日</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {credentials.map(cred => (
            <tr key={cred.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{cred.host}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{cred.port}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{cred.username}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{cred.auth_method}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {new Date(cred.created_at).toLocaleDateString()}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <Link to={`/credentials/${cred.id}/edit`}>編集</Link>
                <button onClick={() => deleteCredential(cred.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// New Credential Page
const NewCredentialPage = () => {
  const [formData, setFormData] = useState({
    host: '',
    port: 22,
    username: '',
    auth_method: 'password',
    password: '',
    ssh_key: ''
  });
  const { apiCall } = useApi();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/credentials/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      navigate('/credentials');
    } catch (error) {
      console.error('作成エラー:', error);
      alert('作成に失敗しました');
    }
  };

  const testConnection = async () => {
    try {
      await apiCall('/credentials/test-connection', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('接続テスト成功');
    } catch (error) {
      console.error('接続テストエラー:', error);
      alert('接続テスト失敗');
    }
  };

  return (
    <div>
      <h1>新規認証情報作成</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ホスト:</label>
          <input
            type="text"
            value={formData.host}
            onChange={(e) => setFormData({...formData, host: e.target.value})}
            required
          />
        </div>
        <div>
          <label>ポート:</label>
          <input
            type="number"
            value={formData.port}
            onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
            required
          />
        </div>
        <div>
          <label>ユーザー名:</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
        </div>
        <div>
          <label>認証方式:</label>
          <select
            value={formData.auth_method}
            onChange={(e) => setFormData({...formData, auth_method: e.target.value})}
          >
            <option value="password">パスワード</option>
            <option value="ssh_key">SSH鍵</option>
          </select>
        </div>
        
        {formData.auth_method === 'password' ? (
          <div>
            <label>パスワード:</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
        ) : (
          <div>
            <label>SSH秘密鍵:</label>
            <textarea
              value={formData.ssh_key}
              onChange={(e) => setFormData({...formData, ssh_key: e.target.value})}
              rows={10}
              cols={50}
              required
            />
          </div>
        )}
        
        <div>
          <button type="button" onClick={testConnection}>接続テスト</button>
          <button type="submit">作成</button>
          <Link to="/credentials">キャンセル</Link>
        </div>
      </form>
    </div>
  );
};

// Job Bundles Page
const JobBundlesPage = () => {
  const [bundles, setBundles] = useState([]);
  const { apiCall } = useApi();

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const data = await apiCall('/bundles/');
      setBundles(data);
    } catch (error) {
      console.error('バンドル取得エラー:', error);
    }
  };

  const deleteBundle = async (id) => {
    if (!confirm('削除しますか？')) return;
    
    try {
      await apiCall(`/bundles/${id}`, { method: 'DELETE' });
      fetchBundles();
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  return (
    <div>
      <h1>ジョブバンドル</h1>
      <Link to="/bundles/new">新規作成</Link>
      
      <div style={{ marginTop: '20px' }}>
        {bundles.map(bundle => (
          <div key={bundle.id} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
            <h3><Link to={`/bundles/${bundle.id}`}>{bundle.name}</Link></h3>
            <p>作成日: {new Date(bundle.created_at).toLocaleDateString()}</p>
            <div>
              <Link to={`/bundles/${bundle.id}/edit`}>編集</Link>
              <Link to={`/bundles/${bundle.id}/upload`}>GJFアップロード</Link>
              <button onClick={() => deleteBundle(bundle.id)}>削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// New Bundle Page
const NewBundlePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    calc_settings: '{}'
  });
  const { apiCall } = useApi();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        calc_settings: JSON.parse(formData.calc_settings)
      };
      await apiCall('/bundles/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      navigate('/bundles');
    } catch (error) {
      console.error('作成エラー:', error);
      alert('作成に失敗しました');
    }
  };

  return (
    <div>
      <h1>新規ジョブバンドル作成</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>名前:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <label>計算設定 (JSON):</label>
          <textarea
            value={formData.calc_settings}
            onChange={(e) => setFormData({...formData, calc_settings: e.target.value})}
            rows={5}
            cols={50}
          />
        </div>
        <div>
          <button type="submit">作成</button>
          <Link to="/bundles">キャンセル</Link>
        </div>
      </form>
    </div>
  );
};

// Molecules Page
const MoleculesPage = () => {
  const [molecules, setMolecules] = useState([]);
  const { apiCall } = useApi();

  useEffect(() => {
    fetchMolecules();
  }, []);

  const fetchMolecules = async () => {
    try {
      const data = await apiCall('/molecules/');
      setMolecules(data);
    } catch (error) {
      console.error('分子取得エラー:', error);
    }
  };

  const deleteMolecule = async (id) => {
    if (!confirm('削除しますか？')) return;
    
    try {
      await apiCall(`/molecules/${id}`, { method: 'DELETE' });
      fetchMolecules();
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  return (
    <div>
      <h1>分子</h1>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>名前</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>電荷</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>多重度</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>バンドルID</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {molecules.map(mol => (
            <tr key={mol.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <Link to={`/molecules/${mol.id}`}>{mol.name}</Link>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{mol.charge}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{mol.multiplicity}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{mol.bundle_id}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <Link to={`/molecules/${mol.id}/edit`}>編集</Link>
                <button onClick={() => deleteMolecule(mol.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Jobs Page
const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const { apiCall } = useApi();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await apiCall('/jobs/');
      setJobs(data);
    } catch (error) {
      console.error('ジョブ取得エラー:', error);
    }
  };

  const cancelJob = async (id) => {
    if (!confirm('キャンセルしますか？')) return;
    
    try {
      await apiCall(`/jobs/${id}/cancel`, { method: 'POST' });
      fetchJobs();
    } catch (error) {
      console.error('キャンセルエラー:', error);
      alert('キャンセルに失敗しました');
    }
  };

  const relaunchJob = async (id) => {
    if (!confirm('再投入しますか？')) return;
    
    try {
      await apiCall(`/jobs/${id}/relaunch`, { method: 'POST' });
      fetchJobs();
    } catch (error) {
      console.error('再投入エラー:', error);
      alert('再投入に失敗しました');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'blue';
      case 'done': return 'green';
      case 'error': return 'red';
      case 'cancelled': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div>
      <h1>ジョブ</h1>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>分子ID</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>ジョブタイプ</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>ステータス</th>
            <th style={{ border: '1px solid #ccc', padding: '8