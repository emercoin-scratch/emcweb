"""empty message

Revision ID: 9f9bdcb7e943
Revises: None
Create Date: 2016-06-04 18:02:09.020635

"""

# revision identifiers, used by Alembic.
revision = '9f9bdcb7e943'
down_revision = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    users_table = op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        mysql_charset='utf8'
    )

    op.create_table(
        'credentials',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, nullable=False),
        sa.Column('name', sa.Unicode(255), nullable=False, unique=True),
        sa.Column('password', sa.Unicode(255), nullable=False),
        mysql_charset='utf8'
    )

    op.create_foreign_key(
        'fk_credentials_users',
        'credentials',
        'users',
        ['user_id'],
        ['id']
    )

    op.bulk_insert(users_table, [{
        'id': 1
    }])


def downgrade():
    op.drop_constraint('fk_credentials_users', 'credentials', type_='foreignkey')

    op.drop_table('credentials')
    op.drop_table('users')
