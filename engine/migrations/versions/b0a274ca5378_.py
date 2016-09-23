"""empty message

Revision ID: b0a274ca5378
Revises: 914c121b231b
Create Date: 2016-06-05 19:59:56.744089

"""

# revision identifiers, used by Alembic.
revision = 'b0a274ca5378'
down_revision = '914c121b231b'

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        'wallets',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, nullable=False),
        sa.Column('name', sa.Unicode(255), nullable=False, unique=True),
        sa.Column('path', sa.Unicode(255), nullable=False),
        mysql_charset='utf8'
    )

    op.create_foreign_key(
        'fk_wallets_users',
        'wallets',
        'users',
        ['user_id'],
        ['id']
    )


def downgrade():
    op.drop_constraint('fk_wallets_users', 'wallets', type_='foreignkey')

    op.drop_table('wallets')
