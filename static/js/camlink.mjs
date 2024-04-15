"use strict";

import { ip } from './ip.mjs';

let code = document.querySelector(".linker>input");
let link = document.querySelector(".link");

let start = document.querySelector(".start");

let baseHost = "https://" + ip;
let port = "5500";



function send(method,address,data={},vid="0", blob="0"){

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
  
  
  console.log(host);

  return fetch(request)
  .then(response=>{
    if (!response.ok){
      throw new Error("unexpected error!");
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





start.addEventListener("click",()=>{
  send("POST","camlink/start/")
  .then(data=>{
    if (data["msg"] == "success"){

      window.location.replace(baseHost+":"+port+"/camlink/start");



    }
  });

});




link.addEventListener("click",()=>{
  send("POST","camlink/link/",{"code":code.value})
  .then(data=>{
    console.log(data['msg']);
    if(data['msg'] == "success"){
      window.location.replace(baseHost+":"+port+"/camlink/record");

    }

  });

});