import paramiko
import os
from models import ServerCredential
from utils.encryption import decrypt_text
from typing import Any


class JobExecutionController:
    def __init__(self, credential: ServerCredential):
        self.host = credential.host
        self.username = credential.username
        self.auth_method = credential.auth_method
        self.password = decrypt_text(credential.password_encrypted)  # type: ignore

    def submit_job(self, local_gjf_path: str, remote_dir: str, filename: str) -> str:
        remote_gjf_path = os.path.join(remote_dir, filename)

        # ファイル転送
        self._upload_file(local_gjf_path, remote_gjf_path)

        # qsub投入
        job_id = self._submit_qsub(remote_gjf_path)
        return job_id

    def _upload_file(self, local_path: str, remote_path: str):
        transport = paramiko.Transport((self.host, 22))  # type: ignore
        transport.connect(username=self.username, password=self.password)  # type: ignore
        sftp = paramiko.SFTPClient.from_transport(transport)
        sftp.put(local_path, remote_path)  # type: ignore
        sftp.close()  # type: ignore
        transport.close()

    def _submit_qsub(self, remote_gjf_path: str) -> str:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname=self.host, username=self.username, password=self.password)  # type: ignore

        cmd = f"cd {os.path.dirname(remote_gjf_path)} && qsubg16 {os.path.basename(remote_gjf_path)}"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        output = stdout.read().decode()
        ssh.close()

        # qsub 出力例: "Your job 12345 ("input.gjf") has been submitted"
        if "job" not in output:
            raise RuntimeError(f"qsub失敗: {output}")
        job_id = output.split("job")[1].split("(")[0].strip()
        return job_id

    def cancel_job(self, job_id: str):
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname=self.host, username=self.username, password=self.password)  # type: ignore

        cmd = f"qdel {job_id}"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        output = stdout.read().decode()
        error = stderr.read().decode()
        ssh.close()

        if "has been deleted" not in output and error:
            raise RuntimeError(f"キャンセル失敗: {error or output}")
