


self.addEventListener('message',function(e){

  if (e.data['msg'] == "terminate"){
    worker.terminate();
  }else if (e.data['msg'] == "send"){
    streamer(e.data['data']);
  }


});





let baseHost = "https://192.168.67.143";
let port = "5500";



function send2(method,address,data={}, vid = "0", blob="0"){

  let host;

  if (blob == "0"){
    host = baseHost + ":" + port + "/requester2/";
  }else{
    host = baseHost + ":" + port + "/streaming2/";
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

  let liveformData = new FormData();
  liveformData.append('chunk',data);

  
  send2("POST","live/stream/",liveformData,"0","1")
  .then(response=>{
      if(response['msg']){
          console.log(response['msg']);
      }
  });

  // console.log('sent');  


}




