"""empty message

Revision ID: 914c121b231b
Revises: 9f9bdcb7e943
Create Date: 2016-06-04 23:26:14.330121

"""

# revision identifiers, used by Alembic.
revision = '914c121b231b'
down_revision = '9f9bdcb7e943'

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        'settings',
        sa.Column('option', sa.Unicode(255), primary_key=True),
        sa.Column('value', sa.Unicode(255), nullable=False),
        mysql_charset='utf8'
    )


def downgrade():
    op.drop_table('settings')
