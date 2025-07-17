"""default value setting

Revision ID: 93221c7b2d59
Revises: 31a05de95d80
Create Date: 2025-07-17 13:55:25.101965

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '93221c7b2d59'
down_revision: Union[str, Sequence[str], None] = '31a05de95d80'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
