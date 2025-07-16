"""initail schema

Revision ID: 31a05de95d80
Revises:
Create Date: 2025-07-17 00:02:28.035167

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "31a05de95d80"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # users
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("local_base_dir", sa.String(length=512), nullable=False),
        sa.Column("remote_base_dir", sa.String(length=512), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )

    # job_bundles
    op.create_table(
        "job_bundles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("calc_settings", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # jobs（parent_job_id だけは後から add 外部キーでもOKだけど、ここでは含めてOK）
    op.create_table(
        "jobs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("molecule_id", sa.UUID(), nullable=False),
        sa.Column("gjf_path", sa.String(length=512), nullable=False),
        sa.Column("log_path", sa.String(length=512), nullable=True),
        sa.Column("job_type", sa.String(length=20), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "queued", "running", "done", "error", "cancelled", name="jobstatus"
            ),
            nullable=False,
        ),
        sa.Column("submitted_at", sa.DateTime(), nullable=False),
        sa.Column("remote_job_id", sa.String(length=100), nullable=True),
        sa.Column("parent_job_id", sa.UUID(), nullable=True),
        sa.ForeignKeyConstraint(
            ["molecule_id"],
            ["molecules.id"],
            name="fk_jobs_molecule_id",
            use_alter=True,
        ),
        sa.ForeignKeyConstraint(["parent_job_id"], ["jobs.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # molecules（latest_job_id の外部キーは後から追加）
    op.create_table(
        "molecules",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("charge", sa.Integer(), nullable=False),
        sa.Column("multiplicity", sa.Integer(), nullable=False),
        sa.Column("structure_xyz", sa.Text(), nullable=False),
        sa.Column("bundle_id", sa.UUID(), nullable=False),
        sa.Column("latest_job_id", sa.UUID(), nullable=True),  # FKはあとで追加
        sa.ForeignKeyConstraint(["bundle_id"], ["job_bundles.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # latest_job_id に対する外部キー制約を後付けで追加（循環参照回避のため）
    op.create_foreign_key(
        "fk_molecules_latest_job_id",
        source_table="molecules",
        referent_table="jobs",
        local_cols=["latest_job_id"],
        remote_cols=["id"],
    )

    # server_credentials
    op.create_table(
        "server_credentials",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("host", sa.String(length=100), nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("password_encrypted", sa.String(length=512), nullable=False),
        sa.Column("auth_method", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("server_credentials")
    op.drop_constraint("fk_molecules_latest_job_id", "molecules", type_="foreignkey")
    op.drop_table("molecules")
    op.drop_table("jobs")
    op.drop_table("job_bundles")
    op.drop_table("users")
