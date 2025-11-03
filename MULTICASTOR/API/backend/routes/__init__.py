from routes.export import export_bp
from routes.health import bp as health_bp

from .routes_cerebrum import cerebrum_bp  # ✅
from .routes_inventory import inventory_bp


def register_routes(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(export_bp)
    app.register_blueprint(cerebrum_bp)  # ✅
