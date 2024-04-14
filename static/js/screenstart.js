"use strict";



let stop = document.querySelector(".stop");
let live = document.querySelector(".live");

let video = document.querySelector(".video");
let container = document.querySelector(".camlink_container");

let canvas = document.querySelector(".canvas");
let ctx = canvas.getContext('2d');

let source;


let baseHost = "https://192.168.171.143";
let port = "5500";



function send(method,address,data={}, vid = "0", blob="0"){

  let host;

  if (blob == "0"){
    host = baseHost + ":" + port + "/requester/";
  }else{
    host = baseHost + ":" + port + "/streaming/";
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





























stop.addEventListener('click',function(){

  send("POST","screenshare/stop/")
  .then(response=>{
    if(response['msg'] == "success"){
      window.location.replace(baseHost+":"+port+"/screenshare/");
    }
  })

})


















function streamer(data){


  send("POST","screenshare/stream/",data,"0","1")
  .then(response=>{
      if(response['msg']){
          console.log(response['msg']);
      }
  });

  
};




let size = [container.offsetWidth,container.offsetHeight]



let constraints = {
  audio:true,
  video:{
      width:size[0],
      height:size[1],
      aspectRatio: 16 / 9,
  }
};




navigator.mediaDevices.getDisplayMedia(constraints)
.then(function(stream){

  if("srcObject" in video){
      video.srcObject = stream;
  }else{
      video.src = window.URL.createObjectURL(stream);
  }

  video.onloadedmetadata = function(){
    video.play();
  };

  source = video;
  playOnCanvas();

  
  let options = {
    mimeType: "video/webm; codecs=vp8",
  };

  let mediaRecorder = new MediaRecorder(stream,options);
  let chunks = [];

  mediaRecorder.start(3000);

  

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
      
      chunks = [];
     
      
  };

}).catch(function(err){
  console.log(err);
});





































// function to change the view of the canvas and selected vid

function playOnCanvas(){
  if(source){
    ctx.drawImage(source,0,0,canvas.width, canvas.height);

    source.requestVideoFrameCallback(playOnCanvas);
  }

}



























