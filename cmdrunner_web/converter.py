"""CmdRunner Web — Form & Data Converters

Utility functions for converting between form data, URL params, and display values.
"""
from datetime import datetime


def user_to_dict(row):
    """Convert a user database row to a dictionary safe for templates."""
    if row is None:
        return None
    d = dict(row)
    if d.get('created_at'):
        try:
            d['created_at_display'] = datetime.strptime(
                d['created_at'][:19], '%Y-%m-%d %H:%M:%S'
            ).strftime('%b %d, %Y')
        except (ValueError, TypeError):
            d['created_at_display'] = d.get('created_at', '')
    else:
        d['created_at_display'] = ''
    return d


def sanitize_form_data(form_dict, allowed_fields):
    """Strip form data to only allowed fields, removing extras."""
    return {k: v for k, v in form_dict.items() if k in allowed_fields}