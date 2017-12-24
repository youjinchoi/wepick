#! /bin/bash
REPO_DIR=~/repo
LOGS_DIR=~/logs
SCRIPTS_DIR=~/scripts
NGINX_CONF_DIR=/etc/nginx
NGINX_LOG_DIR=/var/log/nginx
NODE_PORT_FILE=~/.current_node_port

cd $REPO_DIR;
git fetch;git pull;
npm install;

CURRENT_NODE_PORT=`cat ~/$NODE_PORT_FILE`
if [ "$CURRENT_NODE_PORT" = '8080' ]
then
	NEW_NODE_PORT=8081
else
	NEW_NODE_PORT=8080
fi

OLD_NODE_PORT=$CURRENT_NODE_PORT

$SCRIPTS_DIR/server_start.sh $NEW_NODE_PORT
rm $NGINX_CONF_DIR/conf.d/wepick.conf
ln -s $NGINX_CONF_DIR/conf.d wepick.conf $NGINX_CONF/conf.d/wepick.$NEW_NODE_PORT.conf
sudo systemctl reload nginx
echo $NEW_NODE_PORT > ~/$NODE_PORT_FILE

OLD_NODE_PID=`ps -ef | grep node | grep $OLD_NODE_PORT | awk '{print $2}'`
kill -9 $OLD_NODE_PID