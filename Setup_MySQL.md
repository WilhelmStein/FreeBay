# How to setup MySQL

## Install mysql

* Download and install [MySQL Workbench](https://www.mysql.com/products/workbench/). You can use Ubuntu Software as well
* Download mysql-server:
```bash
sudo apt install mysql-server
```

## Connect without sudo

```bash
sudo mysql -u root

# While in mysql environment:

# Optional
SELECT User, Host FROM mysql.user;

# Output
# +------------------+-----------+
# | User             | Host      |
# +------------------+-----------+
# | admin            | localhost |
# | debian-sys-maint | localhost |
# | magento_user     | localhost |
# | mysql.sys        | localhost |
# | root             | localhost |
# +------------------+-----------+

# Delete current root@localhost acount
DROP USER 'root'@'localhost';
# Query OK, 0 rows affected (0,00 sec)

# Recreate your user
CREATE USER 'root'@'%' IDENTIFIED BY '';
# Query OK, 0 rows affected (0,00 sec)

# Give permissions to your user 
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
# Query OK, 0 rows affected (0,00 sec)

# Flush privileges
FLUSH PRIVILEGES;
# Query OK, 0 rows affected (0,01 sec)

exit
```

Now you can connect to mysql without using sudo like so:
```bash
mysql -u root
```

## Setup password

```bash
# Outside of the mysql environment
mysqladmin -u root password password
```
This will setup a password called 'password' **DO NOT CHANGE THAT**.


### Login

You should be able to log into mysql with :
```bash
mysql -u root -p
```
When prompted type the password and everything should work fine.

### Change Password

```bash
touch ~/mysql-pwd
echo "ALTER USER 'root'@'localhost' IDENTIFIED BY 'PASSWORD';" > ~/mysql-pwd
# where PASSWORD is the new password

sudo systemctl stop mysql
sudo mysqld -init-file=~/mysql-pwd

sudo systemctl start mysql
```

You should be able to log into mysql with :
```bash
mysql -u root -p
```
When prompted type the password and everything should work fine.