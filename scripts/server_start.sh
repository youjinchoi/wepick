#! /bin/bash
REPO_DIR=~/repo
PHASE=`cat ~/.phase`

if [[ "$1" != "" ]]; then
    PORT=$1
else
    PORT=8080
fi

nohup node $REPO_DIR/src/app --port=$PORT --phase=$PHASE >> ~/logs/node/node_$PORT.log &
sleep 3
NODE_STATUS=`curl -s localhost:$PORT/connection-test`
if [[ "$NODE_STATUS" != "OK" ]]; then
    echo 'Node start error.'
    exit 1
fi