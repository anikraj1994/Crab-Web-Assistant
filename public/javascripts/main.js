var recognizing = false;
var ignore_onend;
var start_timestamp;
var final_span=document.getElementById("final_span");
var interim_span=document.getElementById("interim_span");


        if (!('webkitSpeechRecognition' in window)) {
        upgrade();
        } else {
        var recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = function() {
            recognizing = true;
            document.getElementById("fab-image").src="/images/mic-listening.png";
            animate_fab_right();
            console.log("start");
        };

        recognition.onerror = function(event) {
            alert(event.error+"");
            console.log("error");
            
        };

        recognition.onend = function() {
            recognizing = false;
            document.getElementById("fab-image").src="/images/mic.png";  
            animate_fab_left();    
            console.log("end");
                  
        };

        recognition.onresult = function(event) {
            console.log("results");
            
            var interim_transcript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
            }
            final_transcript = capitalize(final_transcript);
            final_span.innerHTML = linebreak(final_transcript);
            interim_span.innerHTML = linebreak(interim_transcript);

            if(final_transcript){
                addToList('<p>'+final_transcript+'</p>',true);
                callWit(final_transcript);
            }
        };
        }
        var two_line = /\n\n/g;
        var one_line = /\n/g;
        function linebreak(s) {
        return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
        }

        var first_char = /\S/;
        function capitalize(s) {
        return s.replace(first_char, function(m) { return m.toUpperCase(); });
        }

        function startButton(event) {
        if (recognizing) {
            recognition.stop();
            return;
        }
        final_transcript = '';
        recognition.lang = "en-IN";
        recognition.start();
        ignore_onend = false;
        final_span.innerHTML = '';
        interim_span.innerHTML = '';
        start_timestamp = event.timeStamp;
        }    

        function addToList(message,isMe){
           
                var xli=document.createElement("li");
                var xdiv=document.createElement("div");
               if(isMe) xli.className="self";
               else xli.className="other";
                xdiv.className="msg";
                xdiv.innerHTML=message;
                xli.appendChild(xdiv);
                document.getElementById("chat-window").append(xli);
  final_span.innerHTML = "";
            interim_span.innerHTML ="";
            
            
        }

        function callWit(message){
            ajax("/api/?message="+message).then(function(result) {
                addToList('<p>'+result+'</p>',false);
            }).catch(function() {
                // An error occurred
                console.log("error");
                addToList("<p>Something went wrong. I couldnt contact my server</p>",false);
            });
        }

        function ajax(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            resolve(this.responseText);
        };
        xhr.onerror = reject;
        xhr.open('GET', url);
        xhr.send();
    });
}

        function animate_fab_right(){
            document.getElementById("results").className="result z-2";
        let flip = new FLIP({
        element: document.getElementById("fab"),
        duration: 300
        });
        flip.first();
        flip.last('fab-container-right');
        flip.invert();
        flip.play();
       flip.removeClass("fab-container");
        }
        function animate_fab_left(){
            document.getElementById("results").className="result";
            
        let flip = new FLIP({
        element: document.getElementById("fab"),
        duration: 300
        });
        flip.first();
        flip.last('fab-container');
        flip.invert();
        flip.play();
       flip.removeClass("fab-container-right");
        
        }
        