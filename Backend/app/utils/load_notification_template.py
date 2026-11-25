import os
from jinja2 import Template
    
    
def load_email_template(template_name, **kwargs):
    """
    Loads and formats an SMS template with the given arguments.

    Args:
        template_name (str): Name of the template file (without extension).
        kwargs (dict): Arguments to format the template.

    Returns:
        str: The formatted SMS message.
    """
    # Get the absolute path to the current file's directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    subject_path = os.path.join(base_dir, "email_template", f"{template_name}_subject.txt")
    body_path = os.path.join(base_dir, "email_template", f"{template_name}_body.html")
    
    
    project_name = os.getenv("project_name")
    project_email_id = os.getenv("project_email_id")
    project_logo = os.getenv("project_logo")

    if project_name:
        kwargs["PROJECT_NAME"] = project_name
        kwargs["PROJECT_EMAIL_ID"] = project_email_id
        kwargs["PROJECT_LOGO"] = project_logo
    try:
        with open(subject_path, "r", encoding="utf-8") as file:
            subject_template = file.read()
        # Use Jinja2 for rendering
        subject = Template(subject_template).render(**kwargs)

        # Load and format the body
        with open(body_path, "r", encoding="utf-8") as file:
            body_template = file.read()
        # Use Jinja2 for rendering
        body = Template(body_template).render(**kwargs)

        return subject, body
    except Exception as e:
        error = f"Error loading template: {str(e)}"
        return error, error
    
    
    

        

def load_push_notification_template(template_name, **kwargs):
    """
    Loads and formats an SMS template with the given arguments.

    Args:
        template_name (str): Name of the template file (without extension).
        kwargs (dict): Arguments to format the template.

    Returns:
        str: The formatted SMS message.
    """
    # Get the absolute path to the current file's directory
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(base_dir, "push_notification_template", f"{template_name}_title.txt")
    body_path = os.path.join(base_dir, "push_notification_template", f"{template_name}_body.txt")
    
    project_name = os.getenv("project_name")
    if project_name:
        kwargs["PROJECT_NAME"] = project_name
        
    try:
        with open(template_path, "r", encoding="utf-8") as file:
            template = file.read()
            title=template.format(**kwargs)
            
        with open(body_path, "r", encoding="utf-8") as file:
            template = file.read()
            body=template.format(**kwargs)
        return title,body
    except Exception as e:
        error = f"Error loading template: {str(e)}"
        return error, error