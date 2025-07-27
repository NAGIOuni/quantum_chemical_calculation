from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()

FERNET_KEY = os.environ.get("FERNET_KEY")
if FERNET_KEY is None:
    raise RuntimeError("環境変数 FERNET_KEY が設定されていません。")

fernet = Fernet(FERNET_KEY.encode())


def encrypt_text(plain: str) -> str:
    return fernet.encrypt(plain.encode()).decode()


def decrypt_text(token: str) -> str:
    return fernet.decrypt(token.encode()).decode()
