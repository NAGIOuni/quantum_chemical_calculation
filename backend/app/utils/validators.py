import re
from typing import Any
from .exceptions import ValidationError


def validate_username(username: str) -> str:
    """ユーザー名の妥当性検証"""
    if not username or len(username) < 3:
        raise ValidationError("ユーザー名は3文字以上である必要があります")
    if len(username) > 50:
        raise ValidationError("ユーザー名は50文字以下である必要があります")
    if not re.match(r"^[a-zA-Z0-9_-]+$", username):
        raise ValidationError(
            "ユーザー名は英数字、アンダースコア、ハイフンのみ使用可能です"
        )
    return username


def validate_password(password: str) -> str:
    """パスワードの妥当性検証"""
    if not password or len(password) < 8:
        raise ValidationError("パスワードは8文字以上である必要があります")
    if len(password) > 128:
        raise ValidationError("パスワードは128文字以下である必要があります")
    return password


def validate_path(path: str, field_name: str) -> str:
    """ファイルパスの妥当性検証"""
    if not path:
        raise ValidationError(f"{field_name}は必須項目です")
    if len(path) > 512:
        raise ValidationError(f"{field_name}は512文字以下である必要があります")
    # 危険な文字の除外
    dangerous_chars = ["..", ";", "|", "&", "$", "`"]
    if any(char in path for char in dangerous_chars):
        raise ValidationError(f"{field_name}に不正な文字が含まれています")
    return path


def validate_charge_multiplicity(charge: int, multiplicity: int) -> tuple[int, int]:
    """電荷とスピン多重度の妥当性検証"""
    if not isinstance(charge, int):
        raise ValidationError("電荷は整数である必要があります")
    if not isinstance(multiplicity, int):
        raise ValidationError("スピン多重度は整数である必要があります")
    if multiplicity < 1:
        raise ValidationError("スピン多重度は1以上である必要があります")
    if abs(charge) > 10:
        raise ValidationError("電荷の絶対値は10以下である必要があります")
    return charge, multiplicity
