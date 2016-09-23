from flask import current_app

from .views import module_bp
from .models import Users
from emcweb.exts import login_manager


# init user loader
@login_manager.user_loader
def load_user(user_id):
    try:
        user = Users.query.get(user_id)
        current_app.config['DB_FALL'] = 0
    except:
        current_app.config['DB_FALL'] = 2
        return None

    return user

