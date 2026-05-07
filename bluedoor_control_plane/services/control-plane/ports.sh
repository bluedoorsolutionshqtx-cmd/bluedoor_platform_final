declare -A ports=(
["specialist-controller"]=3002
["contract-service"]=3003
["contract-engine"]=3004
["registry-service"]=3005
["policy-service"]=3006
["risk-engine"]=3007
["approval-service"]=3008
["execution-service"]=3009
["audit-service"]=3010
["memory-service"]=3011
["ai-assistant-api"]=3012
["ai-ops-guardian"]=3013
["ai-compliance-engine"]=3014
["ai-backup-controller"]=3015
)

for svc in "${!ports[@]}"
do
cat > "$svc/.env" <<ENV
SERVICE_NAME=$svc
PORT=${ports[$svc]}

NODE_ENV=development

REDIS_HOST=127.0.0.1
REDIS_PORT=6380
REDIS_PASSWORD=bluedoor-redis-pass

LOG_LEVEL=info
ENV
done
