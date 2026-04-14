#!/bin/sh
set -e

echo "========================================="
echo "🚀 INICIANDO FRONTEND REACT"
echo "========================================="

# Verificar que BACKEND_URL esté definida
if [ -z "$BACKEND_URL" ]; then
    echo "❌ ERROR: BACKEND_URL no está definida"
    echo "✅ Ejemplo: http://mi-backend-alb-123456789.us-east-1.elb.amazonaws.com:8080"
    exit 1
fi

echo "📋 BACKEND_URL: $BACKEND_URL"

# Validar formato de URL
# if ! echo "$BACKEND_URL" | grep -qE '^http://|^https://'; then
#     echo "❌ ERROR: BACKEND_URL debe comenzar con http:// o https://"
#     exit 1
# fi

# Exportar variable para envsubst
export BACKEND_URL

# Generar configuración de nginx
echo "📋 Generando configuración de nginx..."
envsubst '$BACKEND_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Verificar que el reemplazo funcionó
echo "📋 Verificando configuración generada:"
grep proxy_pass /etc/nginx/conf.d/default.conf

echo "✅ nginx configurado correctamente"
echo "========================================="

# Iniciar nginx (modo foreground)
nginx -g 'daemon off;'