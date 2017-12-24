#! /bin/bash

DATE=$(date +"%Y%m%d%H%M")
MEMORY_USED=`free | grep Mem | awk '{print $3/$2 * 100.0}'`

echo "$DATE: $MEMORY_USED" >> ~/logs/monitor/memory_usage.log