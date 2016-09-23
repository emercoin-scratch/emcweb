"""empty message

Revision ID: b08f7fd82be9
Revises: 23c645b021fe
Create Date: 2016-09-08 20:57:41.777305

"""

# revision identifiers, used by Alembic.
revision = 'b08f7fd82be9'
down_revision = '23c645b021fe'

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.drop_column('contracts', 'filename')
    op.add_column('contracts', sa.Column('content', sa.UnicodeText, nullable=True))


def downgrade():
    op.drop_column('contracts', 'content')
    op.add_column('contracts', sa.Column('filename', sa.Unicode(255), nullable=True, unique=True))
