#! /bin/bash
REPO_DIR=~/repo
LOGS_DIR=~/logs
SCRIPTS_DIR=~/scripts
NGINX_CONF_DIR=/etc/nginx
NGINX_LOG_DIR=/var/log/nginx
NODE_PORT_FILE=.current_node_port

cd $REPO_DIR;
git fetch;git pull;

# copy script files from repo
cp $REPO_DIR/scripts/* $SCRIPTS_DIR
chmod 755 $SCRIPTS_DIR/*

# build node app and start
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
echo "Node start end."

sleep 3

sudo rm $NGINX_CONF_DIR/conf.d/wepick.conf
sudo ln -s $NGINX_CONF_DIR/conf.d/wepick.$NEW_NODE_PORT.conf $NGINX_CONF_DIR/conf.d/wepick.conf
echo "Nginx config change end."

sleep 3

sudo systemctl reload nginx
echo $NEW_NODE_PORT > ~/$NODE_PORT_FILE
echo "Nginx reload end."

sleep 3

OLD_NODE_PID=`ps -ef | grep node | grep $OLD_NODE_PORT | awk '{print $2}'`
kill -9 $OLD_NODE_PID