import json
import smtplib
import os
from email.message import EmailMessage

def lambda_handler(event, context):
    # Variables de entorno (las configuraremos en el paso 3)
    gmail_user = os.environ.get('GMAIL_USER')
    gmail_password = os.environ.get('GMAIL_PASSWORD')

    for record in event['Records']:
        try:
            # 1. Extraer el cuerpo del mensaje de SQS
            body = json.loads(record['body'])
            
            # 2. Estructurar el correo
            msg = EmailMessage()
            msg['Subject'] = f"Inventory Sales API: Venta #{body.get('IdVenta')}"
            msg['From'] = gmail_user
            msg['To'] = body.get('Email')
            
            contenido = (
                f"Hola {body.get('Cliente')},\n\n"
                f"Se ha registrado exitosamente tu pago.\n"
                f"Monto: ${body.get('Monto')}\n"
                f"Concepto: {body.get('Detalle')}\n\n"
                "¡Gracias por ser parte de nuestra escuela!"
            )
            msg.set_content(contenido)

            # 3. Envío mediante SMTP_SSL (Puerto 465)
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
                smtp.login(gmail_user, gmail_password)
                smtp.send_message(msg)
                
            print(f"Correo enviado a {body.get('Email')}")

        except Exception as e:
            print(f"Error procesando registro: {str(e)}")
            # Al lanzar la excepción, SQS sabe que el mensaje falló 
            # y lo pondrá disponible para reintento.
            raise e

    return {'statusCode': 200, 'body': json.dumps('Procesado con éxito')}