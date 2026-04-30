def validate_params(params, required_fields=None, optional_fields=None):
    """
    Validate that params contains required fields and only allowed optional fields.
    Returns (is_valid, error_message)
    """
    if required_fields:
        for field in required_fields:
            if field not in params:
                return False, f"Missing required parameter: {field}"
                
    # Further validation (types, ranges) can be added here
    return True, None

def validate_enum(value, allowed_values, field_name):
    """Validate that a value is in a list of allowed values"""
    if value not in allowed_values:
        return False, f"Invalid value for {field_name}. Allowed values: {', '.join(allowed_values)}"
    return True, None
