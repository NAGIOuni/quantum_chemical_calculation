"""transfer from UUID to autoincrement

Revision ID: 807e88f187cb
Revises: 93221c7b2d59
Create Date: 2025-07-18 09:51:21.652136

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '807e88f187cb'
down_revision: Union[str, Sequence[str], None] = '93221c7b2d59'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
