from Database.urineTestRepo import urineTestRepo
from Manager.Manager import Manager

# TODO: Change file name urineTestManager -> UrineTestManager
class urineTestManager(Manager):
    def __init__(self):
        Manager.__init__(self, urineTestRepo)
