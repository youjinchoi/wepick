#! /bin/bash
#PHASE=local
#PHASE=dev
PHASE=real

if [[ "$1" != "" ]]; then
    PORT=$1
else
    PORT=8080
fi

nohup node ../src/app --port=$PORT --phase=$PHASE >> ~/logs/node_$PORT.log &
