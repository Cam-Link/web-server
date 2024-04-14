

let video = document.querySelector('.video');



const mimeCodec = 'video/webm; codecs="vp8"';

let mediaSource;

let currentSourceBuffer;

let worker = new Worker('watch_worker.js');


video.addEventListener("click",function(){
  if (!document.fullscreenElement) {
    video.requestFullscreen();
  }else{
    video.webkitExitFullscreen();
  }
})




if ("MediaSource" in window && MediaSource.isTypeSupported(mimeCodec)) {
  mediaSource = new MediaSource;


  video.src = URL.createObjectURL(mediaSource);

  video.onloadedmetadata = function(){
    video.play();
  };

  mediaSource.addEventListener("sourceopen", sourceopen);

}else{
  console.error("Unsupported MIME type or codec: ", mimeCodec);
}

function sourceopen(){
  
  currentSourceBuffer =   mediaSource.addSourceBuffer(mimeCodec);


  currentSourceBuffer.addEventListener('updateend', function (_) {
    worker.postMessage({'msg':'load'});

  });

  worker.postMessage({'msg':'load'});


}


worker.onmessage = function(e){
  // console.log("appending");
  currentSourceBuffer.appendBuffer(e.data);

};




window.addEventListener('beforeunload', function() {
  worker.postMessage({'msg':'terminate'});
});
















