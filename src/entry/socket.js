var socket = socket || (() => {
    function connect() {
        const socketUrl = "http://0.0.0.0:8888"
        const io = require('socket.io-client')
        const theSocket = io(socketUrl)
        theSocket.on("connect", () => {
            console.log("SocketIO Connect")
            theSocket.emit("login", "background")
        });
        theSocket.on("disconnect", (reason) => {
            console.log(reason)
        });
    }

    connect()
})();