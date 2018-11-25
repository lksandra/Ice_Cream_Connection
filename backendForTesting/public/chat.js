//'the net ninja' youtube user tutorial on websockets.
//creatng a realtime chat window.



//as we are calling this file in the index.html and the index has already loaded the socket.io js file
//we have access to those variable inside it.
var serveraddress = "http://localhost:8080"
var frontendsocket = io.connect(serveraddress);

//query dom
var usertext = document.getElementById('usertext'),
    btn = document.getElementById('bttn'),
    alluserstext = document.getElementById('output'); 

//emit event i.e send message to the connected server
btn.addEventListener('click', function(){
    frontendsocket.emit('usertext', {
        'message': usertext.value
    });
});


//listening for alluserstext event from the server i.e already connected.
frontendsocket.on('alluserstext', function(data){
    alluserstext.innerHTML+= '\n' + data.message;
});

