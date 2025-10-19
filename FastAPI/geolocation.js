document.getElementById("btn").onclick = function(){
    //navigator.geolocationを呼び出すことでGeolocation APIを利用できる
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
}

function successCallback(position){
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    document.getElementById("latitude").innerHTML = latitude;
    document.getElementById("longitude").innerHTML = longitude;

    //FasrtAPIに位置情報を送信
    fetch(`http://127.0.01:8000/weather?lat=${latitude}&lon=${longitude}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        document.getElementById("city").innerHTML = data.name;
        document.getElementById("weather").innerHTML = data.weather[0].main;
        document.getElementById("temp").innerHTML = data.main.temp;
    })
    .catch(error => {
        console.error("Error:", error);
    });
};

function errorCallback(error){
    alert("位置情報が取得できませんでした");
    console.log(error);
};

