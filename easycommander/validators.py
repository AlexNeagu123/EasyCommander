import os


class ValidationError(Exception):
    pass


def validate_non_empty(query=False, **kwargs):
    empty_args = [arg_name for arg_name, arg_value in kwargs.items() if arg_value == '']
    error_type = "query parameters" if query else "body fields"
    if len(empty_args) > 0:
        raise ValidationError(f"The following {error_type} must be non-empty: {', '.join(empty_args)}")


def validate_path_is_file(path):
    if not os.path.isfile(path):
        raise ValidationError("A file with this path does not exist on the system")


def validate_path_is_dir(path):
    if not os.path.isdir(path):
        raise ValidationError("A folder with this path does not exist on the system")


def validate_path_exists(path):
    if not os.path.exists(path):
        raise ValidationError("The path does not exist on the system")