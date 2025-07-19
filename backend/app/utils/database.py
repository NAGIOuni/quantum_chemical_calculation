from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def db_transaction(db: AsyncSession):
    """データベーストランザクション管理"""
    try:
        logger.debug("データベーストランザクション開始")
        yield db
        await db.commit()
        logger.debug("データベーストランザクションコミット完了")
    except Exception as e:
        logger.error(f"データベーストランザクションエラー: {str(e)}")
        await db.rollback()
        raise
    finally:
        logger.debug("データベーストランザクション終了")
