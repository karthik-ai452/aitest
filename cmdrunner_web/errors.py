"""CmdRunner Web — Custom Exception Classes"""


class CmdRunnerError(Exception):
    """Base exception for CmdRunner."""
    status_code = 500

    def __init__(self, message=None, status_code=None, payload=None):
        super().__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or {})
        rv['error'] = self.message
        return rv


class NotFoundError(CmdRunnerError):
    """Resource not found."""
    status_code = 404

    def __init__(self, message='Resource not found'):
        super().__init__(message=message, status_code=404)


class UnauthorizedError(CmdRunnerError):
    """User is not authorized to perform this action."""
    status_code = 403

    def __init__(self, message='You do not have permission to perform this action'):
        super().__init__(message=message, status_code=403)


class AuthenticationError(CmdRunnerError):
    """Invalid credentials or not logged in."""
    status_code = 401

    def __init__(self, message='Invalid credentials'):
        super().__init__(message=message, status_code=401)