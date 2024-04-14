"use strict";



let stop = document.querySelector(".stop");
let live = document.querySelector(".live");
let cameras = document.querySelector(".cameras");


let canvas = document.querySelector(".canvas");
let ctx = canvas.getContext('2d');

let source;


let baseHost = "https://192.168.171.143";
let port = "5500";


let go = true; //keeps refreshing and playing going



function send(method,address,data={}, vid = "0", blob="0"){

  let host = baseHost + ":" + port + "/requester/";

  let request;

  let info = {
    'method':method,
    'address':address,
    'data':data,
    'vid':vid,
    'blob':blob,
  };
  
  request = new Request(host,{
    method:"POST",
    mode: 'no-cors',
    headers:{
      "Content-Type":"application/json",
    },
    body:JSON.stringify(info),
  });
  
  
  // console.log(host);

  return fetch(request)
  .then(response=>{
    if (!response.ok){
      throw new Error("unexpected error!");
    }

    if (vid == "1"){

      const contentType = response.headers.get('Content-Type');

      if (contentType.includes('application/json')){
        return response.json();
      }


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

  send("POST","camlink/stop/")
  .then(response=>{
    if(response['msg'] == "success"){
      window.location.replace(baseHost+":"+port+"/camlink/");
    }
  })

})



















let counter = -1;




const mimeCodec = 'video/webm; codecs="vp8,opus"';







// function to refresh the available cameras

let first = true;

const worker = new Worker('interval_worker.js');

worker.postMessage("start");

window.addEventListener('beforeunload', function() {
  worker.postMessage('terminate');
});


worker.onmessage = function(e){

  let newCameras = e.data;


  console.log("newcameras", newCameras);

  newCameras.forEach(camera => {

    counter+=1;


    let html = `
      <div class="camera">
        <video class="video" data-id="${counter}" data-uid="${camera} autoplay"></video>
      </div> 
      `;

    cameras.insertAdjacentHTML('beforeend', html);
    
    if (first){
  
      source = document.querySelector('.video');
      source.classList.add('viewing');

      playOnCanvas();

      first = false;
    }
    


    
    new Player(counter, camera, document.querySelectorAll('.video')[counter]);

    
    
    


  });




};





























class Player{
  constructor(number, uid, video){
    this.number = number;
    this.uid = uid;
    this.cid = 0;
    this.mediasource;
    this.sourcebuffer;
    this.video = video;
    this.first = true;
    this.worker = new Worker('play_worker.js');

    this.starter();
  }


  starter(){

    this.video.onclick = function(){
      source = this.video;
      document.querySelector('.viewing').classList.remove('viewing');
      this.video.classList.add('viewing');

    }.bind(this);


    window.addEventListener('beforeunload', function() {
      this.worker.postMessage({'msg':'terminate'});
    });


    if ("MediaSource" in window && MediaSource.isTypeSupported(mimeCodec)) {
    
      this.mediasource = new MediaSource;
    
    
      this.video.src = URL.createObjectURL(this.mediasource);



      this.mediasource.onsourceopen = function(){
        
        // console.log("adding source buffer");
        this.sourcebuffer = this.mediasource.addSourceBuffer(mimeCodec);

        
        this.sourcebuffer.onupdateend = function (_) {

          if (this.first){
            this.video.play();
            this.first == false;
          }

          // console.log("added event listener")
          this.worker.postMessage({'msg':'load'});
        }.bind(this);

        this.worker.onmessage = function(e){
          // console.log("received msg");

          this.loader(e.data);

        }.bind(this);

        // console.log("starting worker");
        
        this.worker.postMessage({'msg':'start','uid':this.uid});
      
      }.bind(this);
    
    }else{
      console.error("Unsupported MIME type or codec: ", mimeCodec);
    }



  }


  loader(data){

    // console.log("added");

    this.sourcebuffer.appendBuffer(data);

    

  }






}







// function to change the view of the canvas and selected vid

function playOnCanvas(){
  if(source){
    ctx.drawImage(source,0,0,canvas.width, canvas.height);

    source.requestVideoFrameCallback(playOnCanvas);
  }

}



























