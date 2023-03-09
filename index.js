//第一种方法在js页面设置
function test(){
      console.log("，名言刷新，每三秒");
      fetch('https://v1.hitokoto.cn')
        .then(response => response.json())
        .then(data => {
          const hitokoto = document.querySelector('#hitokoto_text')
          const hitokoto_author = document.querySelector('#hitokoto_author')
          //hitokoto.href = `https://hitokoto.cn/?uuid=${data.uuid}`
          hitokoto.innerText = data.hitokoto
          hitokoto_author.innerText = data.from
        })
        .catch(console.error)
 }
 setInterval(test, 5000);//间隔一秒不断循环刷新;
 setTimeout(test,1000);//只刷新一次;
window.onload=function (){

    document.getElementById("reimg").onclick=reimg;
    }

function reimg(){
    var img=document.getElementById("reimg");
    var sound=document.getElementById("sound")
    if(img.src==='https://i.imgtg.com/2023/03/09/YQCwa.png'){
        img.src='https://i.imgtg.com/2023/03/09/YQ3SK.png';
        sound.muted=true;
    }
    else{
        img.src='https://i.imgtg.com/2023/03/09/YQCwa.png';
        sound.muted=false;
    }
}



