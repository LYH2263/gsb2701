#!/usr/bin/env bash
set -e

echo "🧹 停掉旧容器并重启"
docker compose down -v && docker compose up --build -d
