"using strict";



let container = document.querySelector("#container");
let box = document.querySelector('.background');
let preview = document.querySelector('.preview');
let capture = document.querySelector('.capture');

let start = document.querySelector('.start');
let save = document.querySelector('.stop');

let size = [box.offsetWidth,box.offsetHeight]

container.addEventListener("click",function(){
  if (!container.fullscreenElement) {
    container.requestFullscreen();
  }
})







let baseHost = "https://192.168.171.143";
let port = "5500";



function send(method,address,data={}, vid = "0", blob="0"){

  let host;

  if (blob == "0"){
    host = baseHost + ":" + port + "/requester/";
  }else{
    host = baseHost + ":" + port + "/streamer/";
  }

  let request;

  let info = {
    'method':method,
    'address':address,
    'data':data,
    'vid':vid,
    'blob':blob,
  };

  if (blob == "0"){
    request = new Request(host,{
        method:"POST",
        mode: 'no-cors',
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify(info),
      });

  }else{
    request = new Request(host,{
        method:"POST",
        mode: 'no-cors',
        body:data,
      });
  }
  
  
  
  

  return fetch(request)
  .then(response=>{
    if (!response.ok){
      throw new Error("unexpected error!");
    }

    if (vid == "1"){
      return response.arrayBuffer();
    }

    return response.json();
  })
  .then(response=>{

    return response;
  })
  .catch(error=>{
    console.log(error);
  })

}


















function streamer(data){


    send("POST","camlink/stream/",data,"0","1")
    .then(response=>{
        if(response['msg']){
            console.log(response['msg']);
        }
    });

    
};





let constraints = {
    audio:true,
    video:{
        facingMode:"user",
        width:size[0],
        height:size[1],
        aspectRatio: 16 / 9,
    }
};




navigator.mediaDevices.getUserMedia(constraints)
.then(function(stream){
    if("srcObject" in preview){
        preview.srcObject = stream;
    }else{
        preview.src = window.URL.createObjectURL(stream);
    }

    preview.onloadedmetadata = function(){
        preview.play();
    };

    let options = {
      mimeType: "video/webm; codecs=vp8",
    };

    let mediaRecorder = new MediaRecorder(stream,options);
    let chunks = [];

    start.addEventListener('click',function(){
        mediaRecorder.start(3000);
        start.classList.add('hidden');
        save.classList.remove('hidden');
    });

    save.addEventListener('click',function(){
        mediaRecorder.stop();
        start.classList.remove('hidden');
        save.classList.add('hidden');

        preview.classList.add('hidden');
        capture.classList.remove('hidden');
    });

    mediaRecorder.ondataavailable = function(event){
        if(event.data.size > 0 && mediaRecorder.state == "recording"){
            chunks.push(event.data);


            let formData = new FormData();
            formData.append('chunk',event.data);

            
            streamer(formData);


            console.log('sent');  
        };
    };

    mediaRecorder.onstop = function(){
        // saver();
        // let blob = new Blob(chunks, {'type':'video/webm'});
        chunks = [];
        // let videoURL = window.URL.createObjectURL(blob);
        // capture.src = videoURL;
        
    };

}).catch(function(err){
    console.log(err);
});


