let userName
getUserName()
startClock()
//Load default content - summary
loadContent("summary")

//Get user name for the user
function getUserName(){
    if(localStorage.getItem('userName') == null){
        userName = prompt("Please enter your name", "USER NAME");
        localStorage.setItem('userName',userName);
        document.getElementById("userName").innerHTML = userName;
    }
    else{
        userName = localStorage.getItem('userName');
        document.getElementById("userName").innerHTML = userName;
    }
}
//Change User Name
function changeUserName(){
    userName = prompt("Enter new user name", "USER NAME");
    localStorage.removeItem('userName');
    localStorage.setItem('userName',userName);
    document.getElementById("userName").innerHTML = userName;
}

function startClock(){
    let today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    minutes = updateTime(minutes);
    seconds = updateTime(seconds);
    document.getElementById("clock").innerHTML = `${hours} : ${minutes} : ${seconds}`;
    let time = setTimeout(startClock, 500);
}
function updateTime(t){
    if (t < 10) {t = "0" + t};
    return t 
}

//Active selected option and call the loadContent function
function load(selectedElem){
    let elem = document.querySelectorAll(".t-nav li");
    for (let i = 0; i < elem.length; i++){
        elem[i].classList.remove('active-nav');
    }
    selectedElem.classList.add('active-nav');
    loadContent(selectedElem.id);
}
//load content which nav option is selected
function loadContent(id){
    let locationData = "pages/" + id + ".html"
    let getData = new XMLHttpRequest();
    getData.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("main-display").innerHTML = this.responseText;
        }
    }
    getData.open("GET", locationData, true);
    getData.send();

    updateData(id)
};
function updateData(id){
    let identify = {
        id : id
    }
    let getData = new XMLHttpRequest();
    getData.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText)
            // document.getElementById(id + "-list").innerHTML = this.responseText;
        }
    }
    getData.open("POST", "http://localhost:8000/receiveData", true )
    getData.setRequestHeader("Content-Type","application/json; charset=utf-8");
    getData.send((JSON.stringify(identify)))
}
function aare(){
    console.log('task sent to server')
    let myTask = {
        title : document.forms["add-task"]["t-title"].value,
        description: document.forms["add-task"]["t-description"].value,
        date: document.forms["add-task"]["t-date"].value
    }
    let myJSON = JSON.stringify(myTask);
    console.log(myJSON)
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:8000/pandoh", true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send(myJSON);
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            updateData("tasks")
        }
    }
    document.forms["add-task"]["t-title"].value = ""
    document.forms["add-task"]["t-description"].value =""
    document.forms["add-task"]["t-date"].value = ""
    return false
}

