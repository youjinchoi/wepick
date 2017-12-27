#! /bin/bash

DATE=$(date +"%Y%m%d%H%M")

MEMORY_THRESHOLD=80
CPU_THRESHOLD=80
DISK_THRESHOLD=70

free >> memory_$DATE.log
top -bn 1 >> cpu_$DATE.log
df -h >> disk_$DATE.log

MEMORY_USED=`cat memory_$DATE.log | grep Mem | awk '{print $3/$2 * 100.0}'`
CPU_USED=`cat cpu_$DATE.log | grep Cpu | awk '{ print $2 }'`
DISK_USED=`cat disk_$DATE.log | grep /dev/xvda2 | awk '{print $5}'| sed 's/%//g'`

echo -e "$DATE: $MEMORY_USED\t$CPU_USED\t$DISK_USED" >> ~/logs/monitor/monitor.log

SEND_MAIL=0

MEMORY_EXCEED=`echo "$MEMORY_USED - $MEMORY_THRESHOLD > 0" | bc`
if [ $MEMORY_EXCEED -eq 1 ];
then
        SEND_MAIL=1
        echo "MEMORY EXCEED $MEMORY_THRESHOLD: $MEMORY_USED"
fi

CPU_EXCEED=`echo "$CPU_USED - $CPU_THRESHOLD > 0" | bc`
if [ $CPU_EXCEED -eq 1 ];
then
        SEND_MAIL=1
        echo "CPU EXCEED $CPU_THRESHOLD: $CPU_USED"
fi

DISK_EXCEED=`echo "$DISK_USED - $DISK_THRESHOLD > 0" | bc`
if [ $DISK_EXCEED -eq 1 ];
then
        SEND_MAIL=1
        echo "DISK EXCEED $DISK_THRESHOLD: $DISK_USED"
fi

if [ $SEND_MAIL -eq 1 ];
then

echo "Send mail!"
echo "To: dev.youjin.choi@gmail.com, razahel@gmail.com" >> mail_$DATE.txt
echo "Subject: [wepick] memory $MEMORY_USED%, cpu $CPU_USED%, disk $DISK_USED% used." >> mail_$DATE.txt
echo "" >> mail_$DATE.txt
cat memory_$DATE.log >> mail_$DATE.txt
echo "" >> mail_$DATE.txt
cat cpu_$DATE.log >> mail_$DATE.txt
echo "" >> mail_$DATE.txt
cat disk_$DATE.log >> mail_$DATE.txt

echo "" >> mail_$DATE.txt
echo "MongoDB storage used: " `sudo du -sh /var/lib/mongo` >> mail_$DATE.txt

sendmail -t < mail_$DATE.txt

fi
rm *_$DATE.*