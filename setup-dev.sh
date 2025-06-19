#/bin/sh
cd next && npm i
cd ..
cd signaling-server && npm i
cd ..

./local-dev-create-keys.sh