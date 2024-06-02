

let video = document.querySelector('.video');

let seek = false;

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

    if (seek){
      video.currentTime = 5 * 3;
      seek = false;
    }

  });

  worker.postMessage({'msg':'load'});


}


worker.onmessage = function(e){
  // console.log("appending");
  if (e['msg'] == "add"){

    currentSourceBuffer.appendBuffer(e['data'].data);
  }else{

    seek = true;
    currentSourceBuffer.appendBuffer(e['data'].data);
    console.log('synced');
  }

};




window.addEventListener('beforeunload', function() {
  worker.postMessage({'msg':'terminate'});
});
















