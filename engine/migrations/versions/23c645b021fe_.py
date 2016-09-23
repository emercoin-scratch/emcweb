"""empty message

Revision ID: 23c645b021fe
Revises: b0a274ca5378
Create Date: 2016-09-05 11:47:13.592568

"""

# revision identifiers, used by Alembic.
revision = '23c645b021fe'
down_revision = 'b0a274ca5378'

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        'contracts',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, nullable=False),
        sa.Column('filename', sa.Unicode(255), nullable=False, unique=True),
        sa.Column('name', sa.Unicode(255), nullable=False),
        sa.Column('address', sa.Unicode(50), nullable=False),
        sa.Column('url', sa.Unicode(255), nullable=False),
        sa.Column('language', sa.Unicode(2), nullable=False),
        sa.Column('countries', sa.Unicode(255), nullable=False),
        sa.Column('cpc', sa.Float, nullable=False),
        sa.Column('keywords', sa.Unicode(255), nullable=False),
        mysql_charset='utf8'
    )

    op.create_table(
        'contract_texts',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('contract_id', sa.Integer, nullable=False),
        sa.Column('txt', sa.Unicode(255), nullable=False, unique=True),
        mysql_charset='utf8'
    )

    op.create_foreign_key(
        'fk_contracts_users',
        'contracts',
        'users',
        ['user_id'],
        ['id']
    )

    op.create_foreign_key(
        'fk_contract_texts_contracts',
        'contract_texts',
        'contracts',
        ['contract_id'],
        ['id']
    )


def downgrade():
    op.drop_constraint('fk_contracts_users', 'contracts', type_='foreignkey')
    op.drop_constraint('fk_contract_texts_contracts', 'contract_texts', type_='foreignkey')

    op.drop_table('contracts')
    op.drop_table('contract_texts')
