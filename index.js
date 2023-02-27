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
    if(img.src==='http://r.photo.store.qq.com/psc?/V51tNpWb2FonU036uaZ52J0vZx28zxke/45NBuzDIW489QBoVep5mcX0eG2aaojrZXyq77oKW9X6BoY8V40gy.btWam5VStmsX8h5ETd0tGgz4JW*dgmZCEba22aKdNxhT66C8IQFQWY!/r'){
        img.src='http://r.photo.store.qq.com/psc?/V51tNpWb2FonU036uaZ52J0vZx28zxke/45NBuzDIW489QBoVep5mcfqB8IAqMovLnQG0tA4GEMFaeh6RjvBlnGtNyMKFADtyrNX.W09dAOteEBh1ZhCM0Qk2Z9ORgtKPeNpcesZPwls!/r';
        sound.muted=true;
    }
    else{
        img.src='http://r.photo.store.qq.com/psc?/V51tNpWb2FonU036uaZ52J0vZx28zxke/45NBuzDIW489QBoVep5mcX0eG2aaojrZXyq77oKW9X6BoY8V40gy.btWam5VStmsX8h5ETd0tGgz4JW*dgmZCEba22aKdNxhT66C8IQFQWY!/r';
        sound.muted=false;
    }
}



