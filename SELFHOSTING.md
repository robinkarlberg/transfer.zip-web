# Self-hosting guide

This is the self-hosting guide. It will show you how to set up your own compelete file-sharing server.

The self-host guide is still a work in progress. If you encounter issues or notice any inconsistencies, please open an issue - feedback is welcome as development continues.

> [!NOTE]
> This project is tested with Docker Compose V2. Docker Compose V1 will most likely fail to build.

## Setting up

### Prerequisites

- Docker
- Docker Compose
- CPU with AVX support (recommended but workaround exists)

### Quirks

MongoDB 8.0+ requires a CPU with AVX support, which is not available on older, or lower end systems. If your CPU does not support this, use `mongo:4.4`instead in the `docker-compose.yml` file.

### Setting up Quick Transfers

1. Run `./createenv.sh` to create the env-files needed. This will create a random password for mongo as well.

That's all that you need for using Quick Transfers, you can now deploy the service. You can skip the `worker` and `mongo` containers as they are not used.

### Setting up Stored Transfers

To set up Stored Transfers, you need to spin up a [node server](https://github.com/robinkarlberg/transfer.zip-node) and configure it. The node server handles all file operations.

Having seperate servers handling the heavy-duty stuff like uploads and zip bundles, keeps the main site running smoothly. It also enables distributing of several node servers around the world, close to users, to optimize download times.

#### Retrieve public key from the main server
2. Run the main worker once (`docker compose up worker`), or view the logs. A public key will be printed, save this key for later.

#### Setup the node server
3. Clone the [transfer.zip-node](https://github.com/robinkarlberg/transfer.zip-node) repo, on the same machine or any other machine with internet connection. 
4. Run `./createenv.sh` in the new repo, to create the env-files needed.
5. **If you want to use S3 for file storage**: Edit `server/conf.json` with your acess keys, and change the `active` provider to the new provider name. If you want to use disk storage, that's already on by default! :)
6. **If you want to use the built-in caddy**: Edit `.env` and add your domain and email for automatic SSL certificates.
7. Create a `public.pem` file in the `keys` directory in the root of the repo (`./keys/public.pem`) and paste the public key you got from the main worker server. 
8. Deploy the new node server using `docker compose` or the `./deploy-caddy.sh` script.

#### Finishing setup on the main server
9. Edit the `next/conf.json` to include the public url to your new node server.
10. **If you want to use custom branded transfers**: Modify the `S3_` env variables in `next/.env`. Branding assets are stored in buckets atm.
11. Create an account by running `./create-account.sh` while the main server is running. Account creation is not supported by the UI when self-hosting.

## Deploying

There are multiple ways to deploy Transfer.zip, the easiest is to use the built-in caddy config. If you want more control, you can use any reverse proxy. (Examples provided)

### Caddy (built-in)

Transfer.zip comes with a Caddy conf built-in. 

You need to edit the `.env` and set `CADDY_DOMAIN` to your domain for auto-ssl to function.

Run the caddy deploy script to use the `docker-compose.caddy.yml` override.
```
./deploy-caddy.sh
```

> [!WARNING]
> The Caddy container listens by default on `0.0.0.0`. Make sure to firewall it if you don't want to expose it to the internet.


### Any other reverse-proxy

```
docker compose up --build -d
```

**Apache**
For Apache, the configuration needs to include these lines for the reverse proxy to function:
```
ProxyPreserveHost On

ProxyPass /ws ws://localhost:9002/
ProxyPassReverse /ws ws://localhost:9002/

ProxyPass / http://localhost:9001/
ProxyPassReverse / http://localhost:9001/
```

**NGINX**
For NGINX:
```
# Put this at the top
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

# Put this in your server-block
# server {
# ...
    location / {
        proxy_buffering off;        # Enable NextJS streaming

        proxy_pass http://localhost:9001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://localhost:9002/;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
    }
# ...
# }
```
