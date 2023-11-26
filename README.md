# FCL

![image](https://github.com/nathanvarano/fcl/assets/45152772/67bb8517-9f1c-42f3-ac22-43e6371554e2)


## To note
NextJS container doesn't seem to want to connect to Postgresql container. (.env matches docs, and can connect fine to postgresql container when not using NextJS container... Haven't had much time to look into it (6 day work week))

No idea what "machine numbers" are, will attempt to implement correctly during the week if I've got time.

## Install script

```shell
docker-compose up --build --detach
npx prisma migrate dev —name init
```
