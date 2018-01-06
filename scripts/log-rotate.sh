#!/bin/bash

DAYS_TO_KEEP=10
DAYS_TO_KEEP_AS_RAW=3
DATE=$(date +"%Y%m%d")

compress_file(){
    local FILE_DIR=$1
    local FILE_FORMAT=$2
    for LOGFILE in `find $FILE_DIR -mtime +$DAYS_TO_KEEP_AS_RAW -name $FILE_FORMAT|grep -v "gz"|sort`
    do
    	gzip -f $LOGFILE
    	chmod 644 $LOGFILE.gz
    	#chown  irteam.irteam $LOGFILE.gz
    done
}

delete_file(){
    local FILE_DIR=$1
    local FILE_FORMAT=$2
    find $FILE_DIR -mtime +$DAYS_TO_KEEP -name $FILE_FORMAT -exec rm {} \;
}

# NGINX : DELETE
NGINX_LOG_DIR="~/logs/nginx"
NGINX_LOG_FORMAT="*.log-*"

# DELETE
find $NGINX_LOG_DIR -mtime +$DAYS_TO_KEEP -name $NGINX_LOG_FORMAT -exec rm {} \;

# NODE : ROTATE, COMPRESS, DELETE
NODE_LOG_DIR="~/logs/node"
NODE_LOG_FORMAT="node_*.log.*"

# ROTATE
cp $NODE_LOG_DIR/node_8080.log $NODE_LOG_DIR/node_8080.log.$DATE
cp $NODE_LOG_DIR/node_8081.log $NODE_LOG_DIR/node_8081.log.$DATE

# DELETE
delete_file $NODE_LOG_DIR $NODE_LOG_FORMAT

# COMPRESS
compress_file $NODE_LOG_DIR $NODE_LOG_FORMAT

# MONITOR : ROTATE, COMPRESS, DELETE
MONITOR_LOG_DIR="~/logs/monitor"
MONITOR_LOG_FORMAT="monitor.log.*"

# ROTATE
cp $MONITOR_LOG_FORMAT/monitor.log $MONITOR_LOG_FORMAT/monitor.log.$DATE

# DELETE
delete_file $MONITOR_LOG_DIR $MONITOR_LOG_FORMAT

# COMPRESS
compress_file $MONITOR_LOG_DIR $MONITOR_LOG_FORMAT