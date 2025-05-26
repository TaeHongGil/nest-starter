#!/bin/sh
  echo "import default Kibana objects started"

KIBANA_URL="http://localhost:5601"
KIBANA_USER="elastic"
KIBANA_PASS="${ELASTIC_PASSWORD}"
NDJSON_PATH="/usr/share/kibana/config/default.ndjson"

if [ -z "$KIBANA_PASS" ]; then
  echo "[ERROR] ELASTIC_PASSWORD environment variable is not set."
  exit 1
fi

curl -u "$KIBANA_USER:$KIBANA_PASS" -X POST "$KIBANA_URL/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  --form file=@"$NDJSON_PATH"

  echo "import default Kibana objects ended"
