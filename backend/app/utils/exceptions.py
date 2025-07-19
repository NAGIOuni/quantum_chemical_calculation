from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)


class AppException(HTTPException):
    """アプリケーション共通例外クラス"""

    def __init__(self, status_code: int, detail: str, error_code: str | None = None):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        logger.error(f"AppException: {error_code} - {detail}")


class ValidationError(AppException):
    def __init__(self, detail: str):
        super().__init__(status_code=422, detail=detail, error_code="VALIDATION_ERROR")


class NotFoundError(AppException):
    def __init__(self, detail: str):
        super().__init__(status_code=404, detail=detail, error_code="NOT_FOUND")


class UnauthorizedError(AppException):
    def __init__(self, detail: str):
        super().__init__(status_code=401, detail=detail, error_code="UNAUTHORIZED")


class ForbiddenError(AppException):
    def __init__(self, detail: str):
        super().__init__(status_code=403, detail=detail, error_code="FORBIDDEN")


class InternalServerError(AppException):
    def __init__(self, detail: str):
        super().__init__(status_code=500, detail=detail, error_code="INTERNAL_ERROR")
