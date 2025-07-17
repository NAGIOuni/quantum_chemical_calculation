from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()

FERNET_KEY = os.environ.get("FERNET_KEY")
if FERNET_KEY is None:
    raise RuntimeError("環境変数 FERNET_KEY が設定されていません。")

fernet = Fernet(FERNET_KEY.encode())


def encrypt_text(text: str) -> str:
    return fernet.encrypt(text.encode()).decode()


def decrypt_text(encrypted: str) -> str:
    return fernet.decrypt(encrypted.encode()).decode()
