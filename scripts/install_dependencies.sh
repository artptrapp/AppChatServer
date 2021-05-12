# First, lets kill all the nohup / node processes
for PID in `ps -ef | grep nohup | awk '{print $2}'`;
    do kill PID;

for PID in `ps -ef | grep node | awk '{print $2}'`;
    do kill PID;


npm --prefix /var/www/html install /var/www/html