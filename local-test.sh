export DB_HOSTNAME="0.0.0.0"
export DB_DATABASE="pile"
export DB_USERNAME="cicd"
export DB_PASSWORD="pipeline"

docker compose up db \
    --detach \
    --wait
jest
docker compose down
