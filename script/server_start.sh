#! /bin/bash
#PHASE=local
#PHASE=dev
PHASE=real

nohup node ../src/app --port=8080 --phase=$PHASE >> ~/logs/node_8080.log &
nohup node ../src/app --port=8081 --phase=$PHASE >> ~/logs/node_8081.log &