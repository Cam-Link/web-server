

self.addEventListener('message',function(e){
  if (e.data == "start"){

    refresher();
  }else if (e.data == "terminate"){
    worker.terminate();
  }

});








let baseHost = "https://192.168.19.143";
let port = "5500";


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






function refresher(){

  let interval = setInterval(() => {


    send("GET","camlink/refresh/")
    .then(data=>{

      if (data["msg"] == "no new link"){
        return;
      }else{
        let newCameras = data["add"];

        this.self.postMessage(newCameras);


      }
    });


  }, 1600);

}

