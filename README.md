# 1. Download this project

# 2. Install dependencies
	sudo apt-get install git 
	sudo apt-get install curl
	sudo apt-get install docker-compose
	sudo apt-get install npm
	sudo apt-get install jq
	sudo systemctl start docker
	sudo usermod -a -G docker <username>
	sudo docker --version
	sudo docker-compose --version
	systemctl enable docker

# 3. To run the Network
	cd backend/network/
	./network.sh down
	./network.sh up createChannel -c mychannel -ca
	./network.sh deployCC -ccn basic -ccp ../chaincode/ -ccl javascript

# 4. To run GATEWAY - PORT 3000
	cd ../gateway/
	npm install
	node src/app.js

# 5. To run FRONTEND - PORT 5173
	cd ../../frontend/
	npm install
	npm install express
	npm run dev -- --host

# 6. FINISH
	cd ../backend/network/
	./network.sh down
