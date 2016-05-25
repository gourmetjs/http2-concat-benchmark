## Benchmark test for concatenation in HTTP/2 environment

This is a companion repo of [this article](http://example.com).

## Initial setup & installation
First, make sure you have node and npm installed on your machine. Then, run:
```
git clone https://github.com/gourmetjs/http2-concat-benchmark.git
cd http2-concat-benchmark
npm install
npm run build
```

## NGINX Installation and Config

We ran this benchmark test on AWS EC2 t2.small / Amazon Linux 64-bit.

Currently, the prebuilt NGINX package from Amazon Linux's repo is an older
version that doesn't support HTTP/2. We can build the latest version of
NGINX from source code as follows:

```
sudo yum install gcc zlib-devel pcre-devel openssl-devel    # install prerequisites
wget http://nginx.org/download/nginx-1.9.15.tar.gz
tar zxf nginx-1.9.15.tar.gz
cd nginx-1.9.15
./configure --with-http_v2_module --with-http_ssl_module
make
sudo make install
```
**Before continuing, make sure you have purchased a domain name because we will need to configure SSL on it. Remember, just the public IP of your host server will NOT work.** 

After installation, modify NGINX's configuration file as follows. (Default path
is `/usr/local/nginx/nginx.conf` when you build from source code.
REMINDER: Replace `example.com` with your server's hostname.):

```
worker_processes  1;

events {
  worker_connections  1024;
}

http {
  include       mime.types;
  default_type  application/octet-stream;
  sendfile      on;
  keepalive_timeout  65;

  server {
    listen       80;
    server_name  example.com;
    location / {
      root   html;
      index  index.html index.htm;
    }
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   html;
    }
  }

  server {
    listen       443 ssl http2;
    server_name  example.com;
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_ciphers  HIGH:!aNULL:!MD5;
    location / {
      root   html;
      index  index.html index.htm;
    }
  }
}
```
After you've finished configuring NGINX, copy the 4 directories in the project folder (`1000`, `50`, `6` and `1`) under the `_build` directory to the NGINX HTML directory, which is `/usr/local/nginx/html` when you build from source code).
You can run:
```
cp -a ./_build/* /usr/local/nginx/html/
```

## SSL Setup
Because HTTP/2 only works over a HTTPS, you need to install a SSL certificate.
Easiest way is to use [Let's Encrypt](https://letsencrypt.org/) as follows
(make sure that NGINX is not running while running this.)

```
sudo yum install git
git clone https://github.com/certbot/certbot
cd certbot
./certbot-auto certonly --standalone -d example.com --debug
```

## Finish up
Now you can run NGINX:

```
sudo /usr/local/nginx/sbin/nginx
```

To stop:

```
sudo /usr/local/nginx/sbin/nginx -s stop
```

Type in example.com (replace with your domain name) and append /1 /6 /50 /1000 to the URL to see the benchmark loading speed for each corresponding number of bundled assets.
