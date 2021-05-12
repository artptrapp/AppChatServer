# First, lets kill all the nohup / node processes
ps auwwx | gawk '/nohup/{print $2}' | while read PID
do
    sudo kill $PID
done

ps auwwx | gawk '/node/{print $2}' | while read PID
do
    sudo kill $PID
done

# Then, install the dependencies
npm --prefix /var/www/html install /var/www/html