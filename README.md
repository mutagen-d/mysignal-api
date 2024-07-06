# Server

## Install
```bash
npm install --global mysignal-api
```

## env

`.env` file:
```bash
# server port
PORT=80
# basic auth params
AUTH_USER=user
AUTH_PASS=pass
# firebase service account path
FIREBASE_SERVICE_ACCOUNT_JSON="config/firebase-service-account.json"
# huawei config path
HUAWEI_CONFIG_JSON="config/huawei-config.json"
```

## Usage

- direct
  ```bash
  # 1. clone repo
  git clone https://github.com/mutagen-d/mysignal-api
  # 2. go to repo directory
  cd mysignal-api
  # 3. create `.env` file
  cp .env.example .env
  # 4. create config/ dir
  mkdir config
  # 5. create config files, see https://github.com/mutagen-d/mysignal for details
  echo "{}" > config/firebase-service-account.json
  echo "{}" > config/huawei-config.json
  # 6. install dependencies
  npm install
  # 7. run
  node src/main
  ```
- docker
  ```bash
  # follow up to 5th step of direct running
  # 6. build image
  docker build -t mysignal-api .
  # 7. run container
  docker run -d -p 8011:80 mysignal-api
  ```
- docker-compose
  ```bash
  # follow up to 5th step of direct running
  # 6. run
  docker-compose up -d
  ```
## Swagger docs
open docs [localhost:8011/docs](http://localhost:8011/docs). In authentication dialog enter `user` as user and `pass` as password

