import paramiko
from datetime import datetime
import os


def get_log_tail_via_ssh(
    host: str, username: str, password: str, log_path: str, lines: int = 30
):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname=host, username=username, password=password)

    cmd = f"tail -n {lines} {log_path}"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    ssh.close()

    if err:
        raise RuntimeError(err)
    return out


def get_job_status_via_qstat(
    host: str, username: str, password: str, remote_job_id: str
) -> str:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname=host, username=username, password=password, timeout=10)

    cmd = f"qstat -x {remote_job_id}"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    output = stdout.read().decode()
    ssh.close()

    if remote_job_id not in output:
        return "C"  # Completed or no longer listed
    elif " R " in output:
        return "R"
    elif " Q " in output:
        return "Q"
    else:
        return "?"  # Unknown
