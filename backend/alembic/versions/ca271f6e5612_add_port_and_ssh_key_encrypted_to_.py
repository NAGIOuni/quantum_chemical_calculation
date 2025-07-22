# alembic/versions/ca271f6e5612_add_port_and_ssh_key_encrypted_to_.py

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "ca271f6e5612"
down_revision = "dbd1b298e7e5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1) ENUM 型を作成
    authmethod = postgresql.ENUM("password", "ssh_key", name="authmethod")
    authmethod.create(op.get_bind(), checkfirst=True)

    # 2) 新規カラム追加
    op.add_column(
        "server_credentials",
        sa.Column("port", sa.Integer(), nullable=False, comment="SSH ポート番号"),
    )
    op.add_column(
        "server_credentials",
        sa.Column(
            "ssh_key_encrypted",
            sa.String(),
            nullable=True,
            comment="Fernet 暗号化済み秘密鍵",
        ),
    )

    # 3) auth_method を ENUM 型に変換（既存データをキャスト）
    op.alter_column(
        "server_credentials",
        "auth_method",
        existing_type=sa.VARCHAR(length=20),
        type_=authmethod,
        postgresql_using="auth_method::authmethod",
        comment="認証方式(`password` or `ssh_key`)",
        existing_nullable=False,
    )

    # 4) password_encrypted を nullable に
    op.alter_column(
        "server_credentials",
        "password_encrypted",
        existing_type=sa.VARCHAR(length=512),
        nullable=True,
        comment="Fernet 暗号化済みパスワード",
    )


def downgrade() -> None:
    # 1) auth_method を元に戻す
    op.alter_column(
        "server_credentials",
        "auth_method",
        existing_type=postgresql.ENUM("password", "ssh_key", name="authmethod"),
        type_=sa.VARCHAR(length=20),
        postgresql_using="auth_method::VARCHAR",
        existing_nullable=False,
    )
    # 2) カラム削除
    op.drop_column("server_credentials", "ssh_key_encrypted")
    op.drop_column("server_credentials", "port")
    # 3) ENUM 型削除
    authmethod = postgresql.ENUM("password", "ssh_key", name="authmethod")
    authmethod.drop(op.get_bind(), checkfirst=True)
