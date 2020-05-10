//Stores user name
let userName ;

//Stores today's date
let today ;

//Contains data called from node server 
let rData ;

// Keeps a track of which task are we working on
let tracker;

// Keeps a track of tab which is opened to make the functions run accordingly
let tabTracker;

getUserName();
startClock();

//Load default content - summary
loadContent("tasks");

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

//Change or Update User Name
function changeUserName(){
    userName = prompt("Enter new user name", "USER NAME");
    localStorage.removeItem('userName');
    localStorage.setItem('userName',userName);
    document.getElementById("userName").innerHTML = userName;
}

function startClock(){
    today = new Date();
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
    return t;
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

//load content on which nav option is selected
function loadContent(id){
    let locationData = "pages/" + id + ".html"
    let getData = new XMLHttpRequest();
    getData.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            // console.log("we in")
            document.getElementById("main-display").innerHTML = this.responseText;
            updateData(id)
            tabTracker = id 
            // Close details tab if left opened
            closeTask()
        }
    }
    getData.open("GET", locationData, true);
    getData.send();
};

// update data on tab which is opened or which is being worked on
function updateData(id){
    let identify = {
        id : id
    }
    let getData = new XMLHttpRequest();
    getData.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            console.log(JSON.parse(this.responseText))
            rData = JSON.parse(this.responseText)
            if(rData.length < 2 && id == "tasks"){
                document.getElementById(id + '-list').innerHTML = `<div class="no-data">There are no ${id} to display :( <br/> Add one Now`
            }
            else{
                if(id == "tasks"){
                    updateTasks(rData,id)
                }
                else if(id == "l-priority"){
                    updateLowP()
                }
                else if(id == "m-priority"){
                    updateMediumP()
                }
                else if(id == "h-priority"){
                    updateHighP()
                }
                else{
                    updateCompTasks()
                }
            }
        }
    }
    getData.open("POST", "http://localhost:8000/receiveData", true );
    getData.setRequestHeader("Content-Type","application/json; charset=utf-8");
    getData.send((JSON.stringify(identify)));
}

// show all tasks
function updateTasks(rData,id){
    console.log(id +"-list");
    document.getElementById(id + '-list').innerHTML = ""
    for(let i = 1 ; i <rData.length; i++ ){
        if(rData[i].completed === 1){
            document.getElementById(id + "-list").innerHTML += `<div class="d-flex"><div title="Click if not completed" class="yes-completed d-flex px-1 my-2 align-items-center" id="t-${i}" onclick="taskNotCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-1 ml-1 my-2 align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2" id="task-${i}" onclick="expandTask(this)"><h3 class="completed-task mx-2">${rData[i].tasksTitle}</h3></div></div>`;
        }
        else{
        document.getElementById(id + "-list").innerHTML += `<div class="d-flex"><div title="Click if completed" class="completed d-flex px-1 my-2 align-items-center" id="t-${i}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-1 ml-1 my-2 align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2" id="task-${i}" onclick="expandTask(this)"><h3 class="mx-2">${rData[i].tasksTitle} </h3></div></div>`;
        }
    }
}

// Send task to server to store
function sendTask(){
    // Time when the task is being added to get the time stamp
    time = new Date();
    time = Date.parse(time);

    let tTitle = document.getElementById("task-title").value;
    tTitle = tTitle[0].toUpperCase() + tTitle.slice(1);
    let myTask = {
        title : tTitle,
        timeStamp: time
    }
    let myJSON = JSON.stringify(myTask);
    console.log(myJSON); //This is a check
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:8000/sendtask", true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send(myJSON);
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            // If the task is successfully stored on server, update the data on tasks tab
            console.log('task sent to server')
            updateData("tasks")
        }
    }
    document.getElementById("task-title").value = "";
    return false;
}

//Expand details for single task
function expandTask(x){
    console.log(x.id);
    displayTaskDetails(x.id);
    document.getElementById("details-tab").style.width = "25%";
}

// Fetching Task Details from server
function displayTaskDetails(x){
    console.log(rData)
    let taskNumber = x.substring(5,(x.length));
    tracker = taskNumber
    document.getElementById("deadline-date").value = rData[taskNumber].taskDeadline;
    document.getElementById("sub-tasks").value = rData[taskNumber].taskSubtasks;
    document.getElementById("prior").value = rData[taskNumber].taskPriority;
    document.getElementById("details").value = rData[taskNumber].taskDetails;
}

// Send task details to server and saving it in data.json
function saveDetails(){
    let taskDeadline = document.getElementById("deadline-date").value;
    let taskSubtasks = document.getElementById("sub-tasks").value;
    let taskPriority = document.getElementById("prior").value;
    let taskDetails = document.getElementById("details").value;
    let details = {
        deadLine : taskDeadline,
        subTasks : taskSubtasks,
        priority : taskPriority,
        tdetails : taskDetails,
        trackTask : tracker //tracker keeps a track of which task is currently going on and needs to be updated
    }
    console.log(details)
    details = JSON.stringify(details);
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:8000/sendDetails", true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send(details);
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            // If the date is successfully sent to server, update on console
            console.log('Task details sent to server')
            updateData(tabTracker) //Update data on the tab that is opened
            closeTask()
        }
    }
}

//Expand details for single task
function closeTask(){
    document.getElementById("details-tab").style.width = "0%";
}

//Update High Priority tasks when opened
function updateHighP(){
    let hPrior = [];
    let hTracker = []; // Keeps a track of high prior tasks in sync with server to allow changes or etc
    // Loop through all tasks to find all tasks with high priority
    for(let i = 1; i < rData.length; i++){
        if(rData[i].taskPriority === "hp"){
            hPrior.push(rData[i]);
            hTracker.push(i);
        }
    }
    
    // CLearing previous all tasks
    document.getElementById("High-p-tasks").innerHTML = ""

    // Displaying high priority tasks
    for(let i = 0; i < hPrior.length; i++){
        if(hPrior[i].completed === 1){
            document.getElementById("High-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if not completed" class="yes-completed d-flex px-1 my-2 align-items-center" id="t-${hTracker[i]}" onclick="taskNotCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-1 ml-1 my-2 align-items-center" id="tId-${hTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-H-task d-flex my-2" id="task-${hTracker[i]}" onclick="expandTask(this)"><h3 class="completed-task mx-3">${hPrior[i].tasksTitle} </h3></div></div>`
        }
        else{
            document.getElementById("High-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if completed" class="completed d-flex px-1 my-2 align-items-center" id="t-${hTracker[i]}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-1 ml-1 my-2 align-items-center" id="tId-${hTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-H-task d-flex my-2" id="task-${hTracker[i]}" onclick="expandTask(this)"><h3 class="mx-3">${hPrior[i].tasksTitle} </h3></div></div>`;
        }
    }
}

//Update Medium Priority tasks when opened
function updateMediumP(){
    let mPrior = [];
    let mTracker = []; // Keeps a track of medium prior tasks in sync with server to allow changes or etc
    // Loop through all tasks to find all tasks with medium priority
    for(let i = 1; i < rData.length; i++){
        if(rData[i].taskPriority === "mp"){
            mPrior.push(rData[i]);
            mTracker.push(i);
        }
    }

    // CLearing previous all tasks
    document.getElementById("Medium-p-tasks").innerHTML = ""

    // Displaying high priority tasks
    for(let i = 0; i < mPrior.length; i++){
        if( mPrior[i].completed === 1){
            document.getElementById("Medium-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if not completed" class="yes-completed d-flex px-1 my-2 align-items-center" id="t-${mTracker[i]}" onclick="taskNotCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-1 ml-1 my-2 align-items-center" id="tId-${mTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-M-task d-flex my-2" id="task-${mTracker[i]}" onclick="expandTask(this)"><h3 class="completed-task mx-3">${mPrior[i].tasksTitle} </h3></div></div>`
        }
        else{
            document.getElementById("Medium-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if completed" class="completed d-flex px-1 my-2 align-items-center" id="t-${mTracker[i]}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-1 ml-1 my-2 align-items-center" id="tId-${mTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-M-task d-flex my-2" id="task-${mTracker[i]}" onclick="expandTask(this)"><h3 class="mx-3">${mPrior[i].tasksTitle} </h3></div></div>`
        }
    }
}

//Update Low Priority tasks when opened
function updateLowP(){
    let lPrior = [];
    let lTracker = []; // Keeps a track of low prior tasks in sync with server to allow changes or etc
    // Loop through all tasks to find all tasks with low priority
    for(let i = 1; i < rData.length; i++){
        if(rData[i].taskPriority === "lp"){
            lPrior.push(rData[i]);
            lTracker.push(i);
        }
    }

    // CLearing previous all tasks
    document.getElementById("Low-p-tasks").innerHTML = ""

    // Displaying high priority tasks
    for(let i = 0; i < lPrior.length; i++){
        if(lPrior[i].completed === 1){
            document.getElementById("Low-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if not completed" class="yes-completed d-flex px-1 my-2 align-items-center" id="t-${lTracker[i]}" onclick="taskNotCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-1 ml-1 my-2 align-items-center" id="tId-${lTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-L-task d-flex my-2" id="task-${lTracker[i]}" onclick="expandTask(this)"><h3 class="completed-task mx-3">${lPrior[i].tasksTitle} </h3></div></div>`
        }
        else{
            document.getElementById("Low-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if completed" class="completed d-flex px-1 my-2 align-items-center" id="t-${lTracker[i]}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-1 ml-1 my-2 align-items-center" id="tId-${lTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-L-task d-flex my-2" id="task-${lTracker[i]}" onclick="expandTask(this)"><h3 class="mx-3">${lPrior[i].tasksTitle} </h3></div></div>`;
        }
    }
}

// If a task is completed
function taskCompleted(x){
    console.log(x.id);
    let identifier = x.id;
    identifier = identifier.substring(2,identifier.length);
    let jsonComp ={
        id : identifier
    }
    jsonComp = JSON.stringify(jsonComp);
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:8000/completed", true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send(jsonComp);
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            // If the date is successfully sent to server, update on console
            console.log('Completion status sent to server')
            updateData(tabTracker) //Update data on the tab that is opened
        }
    }
    
}

// Uncheck a completed task
function taskNotCompleted(x){
    console.log(x.id);
    let identifier = x.id;
    identifier = identifier.substring(2,identifier.length);
    let jsonComp ={
        id : identifier
    }
    jsonComp = JSON.stringify(jsonComp);
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:8000/notCompleted", true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send(jsonComp);
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            // If the date is successfully sent to server, update on console
            console.log('Completion status sent to server')
            updateData(tabTracker) //Update data on the tab that is opened
        }
    }
}

function updateCompTasks(){
    console.log(rData)
    if(rData.length <= 1){
        document.getElementById("comp-tasks").innerHTML = `<h4>Completed tasks will be transferred to this tab on every Wednesday and Friday</h4>`;
    }
    else{
        document.getElementById("comp-tasks").innerHTML = ``;
        for(let i = 1; i < rData.length; i++){
            document.getElementById("comp-tasks").innerHTML += `<div class="single-comp-task my-2 px-1"><h3>${rData[i].tasksTitle}</h3></div>`
        }
    }
}

//Remove the selected task
function deleteTask(x){
    console.log(x.id)
    let identify ={
        id : x.id
    }
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST" , "http://localhost:8000/rmtask" , true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send((JSON.stringify(identify)));
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            // If the task is successfully removed from server, update the data on tasks
            updateData(tabTracker);
        }
    }
}
