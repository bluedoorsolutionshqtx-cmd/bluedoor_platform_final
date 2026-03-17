pkg update -y
pkg upgrade -y
pkg install nodejs git openssh -y
npm install -g pnpm

git clone git@github.com:bluedoorsolutionshqtx-cmd/bluedoor_platform_final.git
cd bluedoor_platform_final

pnpm install
