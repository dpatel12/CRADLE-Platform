"""add lastEdited field for Readings

Revision ID: a8ad53e6717c
Revises: 46d3d2542f6a
Create Date: 2021-04-13 06:14:44.249409

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a8ad53e6717c"
down_revision = "46d3d2542f6a"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("reading", sa.Column("lastEdited", sa.BigInteger(), nullable=False))
    # ### end Alembic commands ###
    op.execute("UPDATE reading SET lastEdited = dateTimeTaken")


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("reading", "lastEdited")
    # ### end Alembic commands ###
