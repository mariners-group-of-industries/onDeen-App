def SuccessJson(data):
    return {"status": True, "response": data}, 200

def ErrorJson(data):
    return {"status": False,"response": {"message": data}}, 200

def ValidationErrorJson(data):
    return {"status": False, "response": data}, 400
    
def ExceptionErrorJson():
    return {"status": False, "response": ({"message":"something went wrong,try after someime"})}, 500 

    
def ServiceErrorJson(message):
    return {"message":message, 'error': 'is_errors'}

def AuthErrorJson(data):
    return {"status": False, "response": data}, 403




