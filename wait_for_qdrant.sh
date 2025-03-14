#!/bin/bash

# Espera até o Qdrant estar acessível
until curl -s http://qdrant:6333/health | grep "ok"; do
  echo "Aguardando Qdrant iniciar..."
  sleep 5
done

# Após estar pronto, inicia o app
echo "Qdrant iniciado. Iniciando o app..."
exec "$@"
