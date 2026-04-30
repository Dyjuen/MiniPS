def validate_schema(params, schema):
    """
    Validate params against a schema.
    Schema format:
    {
        'field': {
            'type': type,
            'required': bool,
            'min': val,
            'max': val,
            'allowed': [vals],
            'default': val
        }
    }
    Returns (is_valid, validated_params, error_message)
    """
    validated = {}
    for field, rules in schema.items():
        if field not in params:
            if rules.get('required', False):
                return False, None, f"Missing required parameter: {field}"
            validated[field] = rules.get('default')
            continue
            
        val = params[field]
        
        # Type check
        expected_type = rules.get('type')
        if expected_type and not isinstance(val, expected_type):
            # Try to cast if it's a simple type
            try:
                if expected_type == int: val = int(val)
                elif expected_type == float: val = float(val)
                elif expected_type == str: val = str(val)
                else: return False, None, f"Parameter {field} must be of type {expected_type.__name__}"
            except (ValueError, TypeError):
                return False, None, f"Parameter {field} must be of type {expected_type.__name__}"
        
        # Range check
        if 'min' in rules and val < rules['min']:
            return False, None, f"Parameter {field} must be at least {rules['min']}"
        if 'max' in rules and val > rules['max']:
            return False, None, f"Parameter {field} must be at most {rules['max']}"
            
        # Enum check
        if 'allowed' in rules and val not in rules['allowed']:
            return False, None, f"Invalid value for {field}. Allowed: {', '.join(map(str, rules['allowed']))}"
            
        validated[field] = val
        
    return True, validated, None

def validate_params(params, required_fields=None, optional_fields=None):
    """Legacy wrapper for simple existence check"""
    if required_fields:
        for field in required_fields:
            if field not in params:
                return False, f"Missing required parameter: {field}"
    return True, None

def validate_enum(value, allowed_values, field_name):
    """Validate that a value is in a list of allowed values"""
    if value not in allowed_values:
        return False, f"Invalid value for {field_name}. Allowed values: {', '.join(allowed_values)}"
    return True, None
