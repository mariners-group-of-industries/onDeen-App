class ValidationError(Exception):
    def __init__(self, errors):
        self.errors = errors
        super().__init__(self.errors)

    def __str__(self):
        return f"Validation failed with errors: {self.errors}"


class ServiceError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)
        
    def __str__(self):
        return f"Service error: {self.message}"