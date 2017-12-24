#! /bin/bash
REPO_DIR=~/repo
LOGS_DIR=~/logs
SCRIPTS_DIR=~/scripts
NGINX_CONF_DIR=/etc/nginx
NGINX_LOG_DIR=/var/log/nginx

# clone git repository
cd ~;
git clone https://github.com/youjinchoi/wepick $REPO_DIR

# create directory
mkdir $LOGS_DIR;
mkdir $SCRIPTS_DIR;

# copy script files from repo
cp $REPO_DIR/scripts/* $SCRIPTS_DIR
chmod 755 $SCRIPTS_DIR/*

# set nginx conf files
if [ -e "$NGINX_CONF_DIR/nginx.conf" ]
then
	sudo cp "$NGINX_CONF_DIR/nginx.conf" "$NGINX_CONF_DIR/nginx.conf.old"
fi
sudo cp $REPO_DIR/nginx/nginx.conf $NGINX_CONF_DIR
sudo cp $REPO_DIR/nginx/wepick.*.conf $NGINX_CONF_DIR/conf.d
sudo ln -s $NGINX_CONF/conf.d/wepick.conf $NGINX_CONF/conf.d/wepick.8080.conf

# create symbolic link for logs
sudo ln -s $LOGS_DIR/nginx $NGINX_LOG_DIR

# create log directory for node
mkdir $LOGS_DIR/node