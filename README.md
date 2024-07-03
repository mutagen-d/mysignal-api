# Server

## Usage

- copy `.env.example` to `.env`
  ```bash
  cp .env.example .env
  ```

- place `firebase-service-account.json` and `huawei-config.json` to `config/` folder

- start server
  ```bash
  # direct
  node src/main.js

  # with docker
  docker build -t mysignal-api .
  docker run -d -p 8011:80 mysignal-api

  # with docker-compose
  docker-compose up -d
  ```
- open docs [localhost:8011/docs](http://localhost:8011/docs)

  in authentication dialog entry `user` as user and `pass` as password

