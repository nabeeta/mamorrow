import azure.functions as func


def main(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse("send_reminder placeholder")
