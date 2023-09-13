Health check sample app


- [構成と内容](#構成と内容)
- [利用法 - サーバーをFrontとBackendで分ける場合](#利用法---サーバーをfrontとbackendで分ける場合)
  - [Node.jsのインストール x 2](#nodejsのインストール-x-2)
  - [Frontendアプリのセットアップと実行](#frontendアプリのセットアップと実行)
  - [Backendアプリのセットアップと実行](#backendアプリのセットアップと実行)
  - [ヘルスチェック](#ヘルスチェック)
- [利用方法 - kubernetes](#利用方法---kubernetes)
- [利用方法 - docker compose](#利用方法---docker-compose)


## 構成と内容
client > Frontend app > backend app という構成

Frontend appでのヘルスチェックにて、自身の稼働状態とあわせてBackendのヘルスチェックも実施する


## 利用法 - サーバーをFrontとBackendで分ける場合

### Node.jsのインストール x 2 
FrontendのサーバーとBackendのサーバーでNode.jsのインストールを行います

```
# Download and import the Nodesource GPG key
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

# Create deb repository
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# Install
sudo apt-get update
sudo apt-get install nodejs -y
```


### Frontendアプリのセットアップと実行
Frontendのサーバーにてアプリをセットアップし実行します

```
# nodejsのインストール確認
nodejs -v

# アプリのセットアップ
git clone https://github.com/kota661/health-check-sample-app.git
cd ./health-check-sample-app/frontend
npm install

# アプリの実行
# 例 BACKEND_URL=http://localhost:4000/healthz PORT=3000 npm start
BACKEND_URL={バックエンドのURL} PORT=3000 npm start
```

### Backendアプリのセットアップと実行
Backendのサーバーにてアプリをセットアップし実行します

```
# nodejsのインストール確認
nodejs -v

# アプリのセットアップ
git clone https://github.com/kota661/health-check-sample-app.git
cd ./health-check-sample-app/backend
npm install

# アプリの実行
PORT=4000 npm start
```

### ヘルスチェック
```
# client端末にてcurlでアクセス
# 返すStatus
# - すべて正常 200 
# - 自分が何かしらエラーになっている 500
# - backendに接続できるがエラーとなる 500
# - backendに接続できない 500

# curl -I http://localhost:3000/healthz
curl -I {フロントエンドアプリのURL}/healthz
```

## 利用方法 - kubernetes
```
# 1. git clone
git clone https://github.com/kota661/health-check-sample-app.git
cd ./health-check-sample-app

# 2. yamlを適用して環境作成
kubectl apply -f deployment.yaml
kubectl -n healthcheck get all

# 3. ヘルスチェックを実施。200が帰ってくる
curl http://{workerNodeのIP}:30100/healthz

# 4. backendのPodを０にする
kubectl -n healthcheck patch deployment backend --type json -p='[{"op": "replace", "path": "/spec/replicas", "value": 0}]'

# 5. 再度ヘルスチェック。backendが止まっているので500が帰ってくる
#    (podがちゃんと止まってるのを確認。200が帰ってきた場合は数十秒待ってみる)
curl http://{workerNodeのIP}:30100/healthz

```

## 利用方法 - docker compose
```
# 1. git clone
git clone https://github.com/kota661/health-check-sample-app.git
cd ./health-check-sample-app

# 2. docker composeを利用して環境起動
docker compose up -d

# 3. ヘルスチェックを実施。200が帰ってくる
curl -I localhost:3000/healthz

# 4. backendだけ強制終了
docker compose rm -fsv backend

# 5. 再度ヘルスチェック。backendが止まっているので500が帰ってくる
curl -I localhost:3000/healthz
```

**ログのサンプル**
```
root@satokota-vsi-osa-k8s:~/health-check-sample-app# curl -I localhost:3000/healthz
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 2
ETag: W/"2-nOO9QiTIwXgNtWtBJezz8kv3SLc"
Date: Tue, 12 Sep 2023 11:34:03 GMT
Connection: keep-alive
Keep-Alive: timeout=5

root@satokota-vsi-osa-k8s:~/health-check-sample-app# docker-compose rm -fsv backend
Stopping health-check-sample-app_backend_1 ... done
Going to remove health-check-sample-app_backend_1
Removing health-check-sample-app_backend_1 ... done
root@satokota-vsi-osa-k8s:~/health-check-sample-app# curl -I localhost:3000/healthz
HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 28
ETag: W/"1c-vdd+J36FtAIGsRr0MAMzYnPD7zM"
Date: Tue, 12 Sep 2023 11:35:02 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```
