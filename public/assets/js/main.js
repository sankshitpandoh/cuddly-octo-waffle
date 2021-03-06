/* Stores user name */
let userName ;

/* Stores today's date */
let today ;

/* Contains data called from node server */ 
let rData ;

/* Keeps a track of which task are we working on */
let tracker;

/* Keeps a track of tab which is opened to make the functions run accordingly */
let tabTracker;

 /* Checks if any field is empty or not */
 const isEmpty = str => !str.trim().length;

/* Asks for notification permission from user if it hasn't been denied by user */
if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {       
    });
}

/* Interactive time picker for details tab */
let timepicker = new TimePicker('deadline-time', {
    lang: 'en',
    theme: 'dark'
  });
  timepicker.on('change', function(evt) {
    
    let value = (evt.hour || '00') + ':' + (evt.minute || '00');
    evt.element.value = value;
  
  });
getUserName();
startClock();

/* Load default content - tasks tab */
loadContent("tasks");

/* Get user name for the user */
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

/* Change or Update User Name */
function changeUserName(){
    userName = prompt("Enter new user name", "USER NAME");
    localStorage.removeItem('userName');
    localStorage.setItem('userName',userName);
    document.getElementById("userName").innerHTML = userName;
}

function startClock(){
    today = new Date();
    let tdate = today.getDate();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    minutes = updateTime(minutes);
    seconds = updateTime(seconds);
    // console.log(seconds)
    document.getElementById("clock").innerHTML = `${hours} : ${minutes} : ${seconds}`;
    // Checking if notification needs to be pushed every minute 
    if(seconds == 00 ){
        pushNotification(hours,minutes,tdate);
    }
    let time = setTimeout(startClock, 500);
}
function updateTime(t){
    if (t < 10) {t = "0" + t};
    return t;
}

/* function that checks if there is any task whose deadline is the current time and date - runs once every second */
function pushNotification(x,y,z){
    if(rData == undefined){
        console.log('waiting for async request to complete')
    }
    else{
        for(let i = 1; i < rData.length; i++){
            let t = rData[i].taskDeadlineTime;
            let d = rData[i].taskDeadline;
            let c = rData[i].completed;
            d = d.substring(8,d.length)
            let comTime = x + ":" + y;
            if(t == comTime && d == z && c == 0 ){
                console.log('pushing notification');
                sendNotification(rData[i]);
                count = 0;
            }
        }
    }
}

/* Main Function that sends the push notification to browser */
function sendNotification(x){
    if (!("Notification" in window)) {
            /*  If the browser deosn't support push notifications
        we alert user alert box to inform the user */
        alert(x.tasksTitle);
    }
    else {
        if (Notification.permission === "granted") {
          let notification = new Notification(x.tasksTitle);
        }
    }
}

/* Activate the selected option and call the loadContent function to load the respective content */
function load(selectedElem){
    let elem = document.querySelectorAll(".t-nav li");
    for (let i = 0; i < elem.length; i++){
        elem[i].classList.remove('active-nav');
    }
    selectedElem.classList.add('active-nav');
    loadContent(selectedElem.id);
}

/* load content on which nav option is selected */
function loadContent(id){
    let locationData = "pages/" + id + ".html"
    let getData = new XMLHttpRequest();
    getData.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("main-display").innerHTML = this.responseText;
            updateData(id)
            tabTracker = id 
            /* Close details tab if left opened */
            closeTask()
        }
    }
    getData.open("GET", locationData, true);
    getData.send();
};

/* update data on tab which is opened or which is being worked on 
The second argument is passed only when rData needs to be updated from subtasks menu in real time*/
function updateData(id,x){
    let identify = {
        id : id
    }
    let getData = new XMLHttpRequest();
    getData.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
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
            /* To update subtasks in real time */
            if(x === true){
                displaySubTask();
                displayComments();
            }
        }
    }
    /* replace https://note-it-keeper.herokuapp.com/ to http://localhost:8000 when running locally  */
    getData.open("POST", "https://note-it-keeper.herokuapp.com/receiveData", true );
    getData.setRequestHeader("Content-Type","application/json; charset=utf-8");
    getData.send((JSON.stringify(identify)));
}

/* Display all tasks */
function updateTasks(rData,id){
    console.log(rData)
    document.getElementById("sort-tasks").value = "old-first"
    document.getElementById(id + '-list').innerHTML = ""
    for(let i = 1 ; i <rData.length; i++ ){
        if(rData[i].completed === 1){
            if(rData[i].taskPriority === "hp"){
                document.getElementById(id + "-list").innerHTML += `<div class="d-flex single-container"><div title="Click if not completed" class="yes-completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${i}" onclick="taskNotCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2  align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2 p-1" id="task-${i}" onclick="expandTask(this)"><h3 class="completed-task mx-2 py-1">${rData[i].tasksTitle}</h3><span id="task-comp-${i}"></span></div><div title="high priority" class="high-prior d-flex align-items-center justify-content-center"></div></div>`;
            }
            else if(rData[i].taskPriority === "mp"){
                document.getElementById(id + "-list").innerHTML += `<div class="d-flex single-container"><div title="Click if not completed" class="yes-completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${i}" onclick="taskNotCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2  align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2 p-1" id="task-${i}" onclick="expandTask(this)"><h3 class="completed-task mx-2 py-1">${rData[i].tasksTitle}</h3><span id="task-comp-${i}"></span></div><div title="medium priority" class="med-prior d-flex align-items-center justify-content-center"></div></div>`; 
            }
            else if(rData[i].taskPriority === "lp"){
                document.getElementById(id + "-list").innerHTML += `<div class="d-flex single-container"><div title="Click if not completed" class="yes-completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${i}" onclick="taskNotCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2  align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2 p-1" id="task-${i}" onclick="expandTask(this)"><h3 class="completed-task mx-2 py-1">${rData[i].tasksTitle}</h3><span id="task-comp-${i}"></span></div><div title="low priority" class="low-prior d-flex align-items-center justify-content-center"></div></div>`; 
            }
            else{
            document.getElementById(id + "-list").innerHTML += `<div class="d-flex single-container"><div title="Click if not completed" class="yes-completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${i}" onclick="taskNotCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2  align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2 p-1" id="task-${i}" onclick="expandTask(this)"><h3 class="completed-task mx-2 py-1">${rData[i].tasksTitle}</h3><span id="task-comp-${i}"></span></div></div>`;
            }
            document.getElementById("task-comp-" + i).style.width = "100%";
        }
        else{
            /* When I wrote this only me and God knew how this was working
                Now only God knows */
            if(rData[i].taskSubtasks.length === 0){
                if(rData[i].taskPriority === "hp"){
                    document.getElementById(id + "-list").innerHTML += `<div class="d-flex single-container"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${i}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2 p-1" id="task-${i}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${rData[i].tasksTitle} </h3></div><div title="high priority" class="high-prior d-flex align-items-center justify-content-center"></div></div>`;
                }
                else if(rData[i].taskPriority === "mp"){
                    document.getElementById(id + "-list").innerHTML += `<div class="d-flex single-container"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${i}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2 p-1" id="task-${i}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${rData[i].tasksTitle} </h3></div><div title="medium priority" class="med-prior d-flex align-items-center justify-content-center"></div></div>`;
                }
                else if(rData[i].taskPriority === "lp"){
                    document.getElementById(id + "-list").innerHTML += `<div class="d-flex single-container"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${i}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2 p-1" id="task-${i}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${rData[i].tasksTitle} </h3></div><div title="low priority" class="low-prior d-flex align-items-center justify-content-center"></div></div>`;
                }
                else{
                    document.getElementById(id + "-list").innerHTML += `<div class="d-flex single-container"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${i}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2 p-1" id="task-${i}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${rData[i].tasksTitle} </h3></div></div>`;
                }
            }
            else{
                let compCounter = 0;
                let nCompCounter = 0
                for(let j = 0; j < rData[i].taskSubtasks.length; j++){
                    console.log(rData[i].taskSubtasks[j].completed)
                    if(rData[i].taskSubtasks[j].completed === 1){
                        compCounter  = compCounter + 1
                    }
                    else{
                        nCompCounter = nCompCounter + 1
                    }
                }
                if(rData[i].taskPriority === "hp"){
                    document.getElementById(id + "-list").innerHTML += `<div class="d-flex single-container"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${i}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2 p-1" id="task-${i}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${rData[i].tasksTitle} </h3><span id="task-comp-${i}"></span></div><div title="high priority" class="high-prior"></div></div>`;
                }
                else if(rData[i].taskPriority === "mp"){
                    document.getElementById(id + "-list").innerHTML += `<div class="d-flex single-container"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${i}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2 p-1" id="task-${i}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${rData[i].tasksTitle} </h3><span id="task-comp-${i}"></span></div><div title="medium priority" class="med-prior d-flex align-items-center justify-content-center"></div></div>`;
                }
                else if(rData[i].taskPriority === "lp"){
                    document.getElementById(id + "-list").innerHTML += `<div class="d-flex single-container"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${i}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2 p-1" id="task-${i}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${rData[i].tasksTitle} </h3><span id="task-comp-${i}"></span></div><div title="low priority" class="low-prior d-flex align-items-center justify-content-center"></div></div>`;
                }
                else{
                    document.getElementById(id + "-list").innerHTML += `<div class="d-flex single-container"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${i}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${i}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-task d-flex my-2 p-1" id="task-${i}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${rData[i].tasksTitle} </h3><span id="task-comp-${i}"></span></div></div>`;
                }
                    compBar = 100 / (compCounter + nCompCounter);
                    compBar = compBar * compCounter;
                    if(compBar === 100){
                        let iden = {
                            id : "C-" + i
                        }
                        taskCompleted(iden)
                    }
                    document.getElementById("task-comp-" + i).style.width = compBar + "%"
            }
        }
    }
}

/* Submit task on press of enter key */
function checkTaskSend(event){
    if(event.keyCode === 13){
        // event.preventDefault
        sendTask()
    }
}

/* Send task to server to store */
function sendTask(){
    /* Time when the task is being added to get the time stamp */
    time = new Date();
    time = Date.parse(time);

    let tTitle = document.getElementById("task-title").value;
    if(isEmpty(tTitle)){
        document.getElementById("task-title").value = "";
    }
    else{
        tTitle = tTitle[0].toUpperCase() + tTitle.slice(1);
        let myTask = {
            title : tTitle,
            timeStamp: time
        }
        let myJSON = JSON.stringify(myTask);
        let xhttp = new XMLHttpRequest();
    
        /* replace https://note-it-keeper.herokuapp.com/ to http://localhost:8000 when running locally  */
        xhttp.open("POST", "https://note-it-keeper.herokuapp.com/sendtask", true);
        xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
        xhttp.send(myJSON);
        xhttp.onreadystatechange = function(){
            if (this.readyState == 4 && this.status == 200) {
                /* If the task is successfully stored on server, update the data on tasks tab */
                console.log('task sent to server')
                updateData("tasks")
            }
        }
        document.getElementById("task-title").value = "";
        return false;
    }
}

/* Expand details for single task */
function expandTask(x){
    closeTask()
    console.log(x.id);
    displayTaskDetails(x.id);
    document.getElementById("details-tab").style.width = "25%";
    document.getElementById("main-display").style.width = "70%";
    // console.log(tracker + " " + rData.length + " " + x)
    document.getElementById("task-" + tracker).classList.add("active-task")
}

/* Fetching Task Details from server */
function displayTaskDetails(x){
    console.log(rData)
    let taskNumber = x.substring(5,(x.length));
    tracker = taskNumber
    document.getElementById("deadline-date").value = rData[taskNumber].taskDeadline;
    document.getElementById("deadline-time").value = rData[taskNumber].taskDeadlineTime;
    document.getElementById("prior").value = rData[taskNumber].taskPriority;
    displaySubTask();
    displayComments();
}

/* Send task details to server and saving it in data.json */
function saveDetails(){
    let taskDeadline = document.getElementById("deadline-date").value;
    let taskDeadlineTime = document.getElementById("deadline-time").value;
    let taskPriority = document.getElementById("prior").value;
    let details = {
        deadLine : taskDeadline,
        deadLineTime : taskDeadlineTime,
        priority : taskPriority,
        trackTask : tracker /* tracker has a track of which task is currently going on and needs to be updated */
    }
    console.log(details)
    details = JSON.stringify(details);
    let xhttp = new XMLHttpRequest();

    /* replace https://note-it-keeper.herokuapp.com/ to http://localhost:8000 when running locally  */
    xhttp.open("POST", "https://note-it-keeper.herokuapp.com/sendDetails", true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send(details);
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            /* If the date is successfully sent to server, update on console */
            console.log('Task details sent to server')
            updateData(tabTracker) /* Update data on the tab that is opened */
            closeTask()
        }
    }
}

/* Expand details for single task */
function closeTask(){
    if(document.getElementById("details-tab").offsetWidth == 2){
        document.getElementById("details-tab").style.width = "0%";
        document.getElementById("main-display").style.width = "100%";

    }
    else{
    document.getElementById("details-tab").style.width = "0%";
    document.getElementById("main-display").style.width = "100%";
    document.getElementById("task-" + tracker).classList.remove("active-task");
    }

}

/* Update High Priority tasks when opened */
function updateHighP(){
    let hPrior = [];

    /* Keeps a track of high prior tasks in sync with server to allow changes or etc */
    let hTracker = []; 

    /* Loop through all tasks to find tasks with high priority */
    for(let i = 1; i < rData.length; i++){
        if(rData[i].taskPriority === "hp"){
            hPrior.push(rData[i]);
            hTracker.push(i);
        }
    }
    
    /* CLearing previous all tasks */
    document.getElementById("High-p-tasks").innerHTML = ""

    /* Displaying high priority tasks */
    for(let i = 0; i < hPrior.length; i++){
        if(hPrior[i].completed === 1){
            document.getElementById("High-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if not completed" class="yes-completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${hTracker[i]}" onclick="taskNotCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${hTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-H-task d-flex my-2 p-1" id="task-${hTracker[i]}" onclick="expandTask(this)"><h3 class="completed-task mx-2 py-1">${hPrior[i].tasksTitle} </h3><span id="task-comp-${i}"></span></div></div>`;
            document.getElementById("task-comp-" + i).style.width = "100%";
        }
        else{
            if(hPrior[i].taskSubtasks.length === 0){
                document.getElementById("High-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${hTracker[i]}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${hTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-H-task d-flex my-2 p-1" id="task-${hTracker[i]}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${hPrior[i].tasksTitle} </h3></div></div>`;
            }
            else{
                let compCounter = 0;
                let nCompCounter = 0
                for(let j = 0; j < hPrior[i].taskSubtasks.length; j++){
                    console.log(hPrior[i].taskSubtasks[j].completed)
                    if(hPrior[i].taskSubtasks[j].completed === 1){
                        compCounter  = compCounter + 1
                    }
                    else{
                        nCompCounter = nCompCounter + 1
                    }
                }
                document.getElementById("High-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${hTracker[i]}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${hTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-H-task d-flex my-2 p-1" id="task-${hTracker[i]}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${hPrior[i].tasksTitle} </h3><span id="task-comp-${i}"></span></div></div>`;

                compBar = 100 / (compCounter + nCompCounter);
                compBar = compBar * compCounter;
                if(compBar === 100){
                    console.log(i + " " + tracker)
                    let iden = {
                        id : "C-" + tracker
                    }
                    taskCompleted(iden)
                }
                 document.getElementById("task-comp-" + i).style.width = compBar + "%"
            }
        }
    }
}

/* Update Medium Priority tasks when opened */
function updateMediumP(){
    let mPrior = [];

    /* Keeps a track of medium prior tasks in sync with server to allow changes or etc */
    let mTracker = []; 

    /* Loop through all tasks to find all tasks with medium priority */
    for(let i = 1; i < rData.length; i++){
        if(rData[i].taskPriority === "mp"){
            mPrior.push(rData[i]);
            mTracker.push(i);
        }
    }

    /* Clearing previous all tasks */
    document.getElementById("Medium-p-tasks").innerHTML = ""

    /* Displaying medium priority tasks */
    for(let i = 0; i < mPrior.length; i++){
        if( mPrior[i].completed === 1){
            document.getElementById("Medium-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if not completed" class="yes-completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${mTracker[i]}" onclick="taskNotCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${mTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-M-task d-flex my-2 p-1" id="task-${mTracker[i]}" onclick="expandTask(this)"><h3 class="completed-task mx-2 py-1">${mPrior[i].tasksTitle} </h3><span id="task-comp-${i}"></span></div></div>`;
            document.getElementById("task-comp-" + i).style.width = "100%";
        }
        else{
            if(mPrior[i].taskSubtasks.length === 0){
                document.getElementById("Medium-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${mTracker[i]}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${mTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-M-task d-flex my-2 p-1" id="task-${mTracker[i]}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${mPrior[i].tasksTitle} </h3></div></div>`;
            }
            else{
                let compCounter = 0;
                let nCompCounter = 0
                for(let j = 0; j < mPrior[i].taskSubtasks.length; j++){
                    console.log(mPrior[i].taskSubtasks[j].completed)
                    if(mPrior[i].taskSubtasks[j].completed === 1){
                        compCounter  = compCounter + 1
                    }
                    else{
                        nCompCounter = nCompCounter + 1
                    }
                }
                document.getElementById("Medium-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${mTracker[i]}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${mTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-M-task d-flex my-2 p-1" id="task-${mTracker[i]}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${mPrior[i].tasksTitle} </h3><span id="task-comp-${i}"></span></div></div>`;

                compBar = 100 / (compCounter + nCompCounter);
                compBar = compBar * compCounter;
                if(compBar === 100){
                    console.log(i + " " + tracker)
                    let iden = {
                        id : "C-" + tracker
                    }
                    taskCompleted(iden)
                }
                 document.getElementById("task-comp-" + i).style.width = compBar + "%"
            }
        }
    }
}

/* Update Low Priority tasks when opened */
function updateLowP(){
    let lPrior = [];

    /* Keeps a track of low prior tasks in sync with server to allow changes or etc */
    let lTracker = [];
    
    /* Loop through all tasks to find all tasks with low priority */
    for(let i = 1; i < rData.length; i++){
        if(rData[i].taskPriority === "lp"){
            lPrior.push(rData[i]);
            lTracker.push(i);
        }
    }

    /* Clearing previous all tasks */
    document.getElementById("Low-p-tasks").innerHTML = ""

    /* Displaying low priority tasks */
    for(let i = 0; i < lPrior.length; i++){
        if(lPrior[i].completed === 1){
            document.getElementById("Low-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if not completed" class="yes-completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${lTracker[i]}" onclick="taskNotCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${lTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-L-task d-flex my-2 p-1" id="task-${lTracker[i]}" onclick="expandTask(this)"><h3 class="completed-task mx-2 py-1">${lPrior[i].tasksTitle} </h3><span id="task-comp-${i}"></span></div></div>`;
            document.getElementById("task-comp-" + i).style.width = "100%";
        }
        else{
            if(lPrior[i].taskSubtasks.length === 0){
                document.getElementById("Low-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${lTracker[i]}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${lTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-L-task d-flex my-2 p-1" id="task-${lTracker[i]}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${lPrior[i].tasksTitle} </h3></div></div>`;
            }
            else{
                let compCounter = 0;
                let nCompCounter = 0
                for(let j = 0; j < lPrior[i].taskSubtasks.length; j++){
                    console.log(lPrior[i].taskSubtasks[j].completed)
                    if(lPrior[i].taskSubtasks[j].completed === 1){
                        compCounter  = compCounter + 1
                    }
                    else{
                        nCompCounter = nCompCounter + 1
                    }
                }
                document.getElementById("Low-p-tasks").innerHTML += `<div class="d-flex"><div title="Click if completed" class="completed d-flex px-2 my-2 mr-1 align-items-center" id="t-${lTracker[i]}" onclick="taskCompleted(this)"><i class="fa fa-check"></i></div><div title="Click to delete task" class="del-task d-flex px-2 mr-1 my-2 align-items-center" id="tId-${lTracker[i]}" onclick="deleteTask(this)"><i class="fa fa-trash"></i></div><div class="single-L-task d-flex my-2 p-1" id="task-${lTracker[i]}" onclick="expandTask(this)"><h3 class="mx-2 py-1">${lPrior[i].tasksTitle} </h3><span id="task-comp-${i}"></span></div></div>`;

                compBar = 100 / (compCounter + nCompCounter);
                compBar = compBar * compCounter;
                if(compBar === 100){
                    console.log(i + " " + tracker)
                    let iden = {
                        id : "C-" + tracker
                    }
                    taskCompleted(iden);
                }
                 document.getElementById("task-comp-" + i).style.width = compBar + "%"
            }
        }
    }
}

/* If a task is completed */
function taskCompleted(x){
    console.log(x.id);
    let identifier = x.id;
    identifier = identifier.substring(2,identifier.length);
    let jsonComp ={
        id : identifier
    }
    jsonComp = JSON.stringify(jsonComp);
    let xhttp = new XMLHttpRequest();

    /* replace https://note-it-keeper.herokuapp.com/ to http://localhost:8000 when running locally  */
    xhttp.open("POST", "https://note-it-keeper.herokuapp.com/completed", true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send(jsonComp);
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            /* If the data is successfully sent to server, update on console */
            console.log('Completion status sent to server')
                /* y is passed as true to updateData here to run displaySubTask() as a callback */
                let y = true
                updateData(tabTracker,y);
        }
    }
    
}

/* Uncheck a completed task */
function taskNotCompleted(x){
    console.log(x.id);
    let identifier = x.id;
    identifier = identifier.substring(2,identifier.length);
    let jsonComp ={
        id : identifier
    }
    jsonComp = JSON.stringify(jsonComp);
    let xhttp = new XMLHttpRequest();

    /* replace https://note-it-keeper.herokuapp.com/ to http://localhost:8000 when running locally  */
    xhttp.open("POST", "https://note-it-keeper.herokuapp.com/notCompleted", true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send(jsonComp);
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            /* If the date is successfully sent to server, update on console */
            console.log('Completion status sent to server')
                /* y is passed as true to updateData here to run displaySubTask() as a callback */
                let y = true
                updateData(tabTracker,y);
        }
    }
}

function updateCompTasks(){
    console.log(rData)
    if(rData.length <= 1){
        document.getElementById("comp-tasks").innerHTML = `<h4 class="pl-3">Completed tasks will be transferred to this tab on every Wednesday and Friday</h4>`;
    }
    else{
        document.getElementById("comp-tasks").innerHTML = ``;
        for(let i = 1; i < rData.length; i++){
            document.getElementById("comp-tasks").innerHTML += `<div class="single-comp-task my-2 px-1"><h3>${rData[i].tasksTitle}</h3></div>`
        }
    }
}

/* Remove the selected task */
function deleteTask(x){
    console.log(x.id)
    let iden = (x.id).substring(4, x.id.length)
    console.log(iden)
    let identify ={
        id : iden
    }
    let xhttp = new XMLHttpRequest();
    
    /* replace https://note-it-keeper.herokuapp.com/ to http://localhost:8000 when running locally  */
    xhttp.open("POST" , "https://note-it-keeper.herokuapp.com/rmtask" , true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send((JSON.stringify(identify)));
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            /* If the task is successfully removed from server, update the data on tasks */
            updateData(tabTracker);
            document.getElementById("details-tab").style.width = "0%";
            document.getElementById("main-display").style.width = "100%";
        }
    }
}


/* Submit Sub task on press of enter key */
function checkSubTaskSend(event){
    if(event.keyCode === 13){
        // event.preventDefault
        addSubTask()
    }
}

/* Adding subtasks to a particular task */
function addSubTask(){
    let subT = document.getElementById("sub-task-title").value
    if(isEmpty(subT)){
        document.getElementById("sub-task-title").value = "";
    }
    else{
        let xhttp = new XMLHttpRequest();
        let subTask = {
            sTask : subT,
            trackTask : tracker,
            complete : 0
        }
        /* replace https://note-it-keeper.herokuapp.com/ to http://localhost:8000 when running locally  */
        xhttp.open("POST" , "https://note-it-keeper.herokuapp.com/getSubTask" , true);
        xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
        xhttp.send((JSON.stringify(subTask)));
        xhttp.onreadystatechange = function(){
            if (this.readyState == 4 && this.status == 200) {
                /* y is passed as true to updateData here to run displaySubTask() as a callback */
                let y = true
                updateData(tabTracker,y);
            }
        }
        document.getElementById("sub-task-title").value = "";
    }
}

/* Displaying subtasks for specific task */
function displaySubTask(){
    if(rData[tracker].taskSubtasks.length === 0){
        document.getElementById("sub-tasks").innerHTML = `<p>No Sub Tasks yet</p>`;
    }
    else{
        document.getElementById("sub-tasks").innerHTML = "";
        for(let i = 0; i < rData[tracker].taskSubtasks.length; i++){
            /* Nice */
            if(rData[tracker].taskSubtasks[i].completed === 0){
                document.getElementById("sub-tasks").innerHTML += `<div class="single-sub-task d-flex mb-2" id="subTask-${i}"><div class="at-cont" id="s-t-${i}" onclick="compSubTask(this)"><i class="fa fa-check px-1"></i></div><div class="at-cont" id="st-${i}" onclick="delSubTask(this)"><i class="fa fa-trash px-1"></i></div><div class="single-sub-cont d-flex align-items-center ml-1 px-1"><p>${rData[tracker].taskSubtasks[i].sTask}</p></div></div>`;
            }
            else{
                document.getElementById("sub-tasks").innerHTML += `<div class="single-sub-task d-flex mb-2" id="subTask-${i}"><div class="at-cont-comp" id="s-t-${i}" onclick="unCompSubTask(this)"><i class="fa fa-check px-1"></i></div><div class="at-cont" id="st-${i}" onclick="delSubTask(this)"><i class="fa fa-trash px-1"></i></div><div class="single-sub-cont d-flex align-items-center ml-1 px-1"><p class="completed-sub">${rData[tracker].taskSubtasks[i].sTask}</p></div></div>`;
            }
        }
    }
}

/* Completing a single sub task */
function compSubTask(x){
    let y  = x.id.substring(4,x.length)
    let jsonComp ={
        subId : y,
        tTrack : tracker
    }
    jsonComp = JSON.stringify(jsonComp);
    let xhttp = new XMLHttpRequest();

    /* replace https://note-it-keeper.herokuapp.com/ to http://localhost:8000 when running locally  */
    xhttp.open("POST", "https://note-it-keeper.herokuapp.com/subTComp", true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send(jsonComp);
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            // If the date is successfully sent to server, update on console
            console.log('Sub Task Completion status sent to server')
            /* y is passed as true to updateData here to run displaySubTask() as a callback */
            let y = true
            updateData(tabTracker,y);
        }
    }
}

/* Unchecking Completion status of a single sub task */
function unCompSubTask(x){
    let y  = x.id.substring(4,x.length)
    let jsonComp ={
        subId : y,
        tTrack : tracker
    }
    jsonComp = JSON.stringify(jsonComp);
    let xhttp = new XMLHttpRequest();

    /* replace https://note-it-keeper.herokuapp.com/ to http://localhost:8000 when running locally  */
    xhttp.open("POST", "https://note-it-keeper.herokuapp.com/subTUnComp", true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send(jsonComp);
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            // If the date is successfully sent to server, update on console
            console.log('Sub Task Completion status sent to server')
            /* y is passed as true to updateData here to run displaySubTask() as a callback */
            let y = true
            updateData(tabTracker,y);
        }
    }
}

/* Removing a sub Task */
function delSubTask(x){
    let y  = x.id.substring(3,x.length);
    let jsonComp ={
        subId : y,
        tTrack : tracker
    }
    jsonComp = JSON.stringify(jsonComp);
    let xhttp = new XMLHttpRequest();

    /* replace https://note-it-keeper.herokuapp.com/ to http://localhost:8000 when running locally  */
    xhttp.open("POST", "https://note-it-keeper.herokuapp.com/removeSub", true);
    xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
    xhttp.send(jsonComp);
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            // If the date is successfully sent to server, update on console
            console.log('Sub Task Completion status sent to server')
            /* y is passed as true to updateData here to run displaySubTask() as a callback */
            let y = true
            updateData(tabTracker,y);
        }
    }
}

/* Submit Comments on press of enter key */
function checkCommentSend(event){
    if(event.keyCode === 13){
        // event.preventDefault
        addComment()
    }
}

/* Adding comments to a particular task */
function addComment(){
    console.log(userName)
    let comT = document.getElementById("comment-title").value
    if(isEmpty(comT)){
        document.getElementById("comment-title").value = "";
    }
    else{
        let xhttp = new XMLHttpRequest();
        let comment = {
            com : comT,
            trackTask : tracker,
            by : userName
        }
        /* replace https://note-it-keeper.herokuapp.com/ to http://localhost:8000 when running locally  */
        xhttp.open("POST" , "https://note-it-keeper.herokuapp.com/getComment" , true);
        xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
        xhttp.send((JSON.stringify(comment)));
        xhttp.onreadystatechange = function(){
            if (this.readyState == 4 && this.status == 200) {
                /* y is passed as true to updateData here to run displaySubTask() as a callback */
                let y = true
                updateData(tabTracker,y);
            }
        }
        document.getElementById("comment-title").value = "";
    }
}

/* Displaying comments for a specific task */
function displayComments(){
    if(rData[tracker].taskComments.length === 0){
        document.getElementById("comments-cont").innerHTML = `<p>No Comments yet</p>`;
    }
    else{
        document.getElementById("comments-cont").innerHTML = "";
        for(let i = 0; i < rData[tracker].taskComments.length; i++){
            if(rData[tracker].taskComments[i].byUser === userName){
                document.getElementById("comments-cont").innerHTML += `<div class="single-comment-origin d-flex my-1 mr-1"><p class="p-1">${rData[tracker].taskComments[i].comment}</p></div>`;
            }
            else{
                document.getElementById("comments-cont").innerHTML += `<div class="diff-origin-cont mb-1"><p class="ml-1">${rData[tracker].taskComments[i].byUser}</p><div class="single-comment-diff-origin d-flex mb-1 ml-1"><p class="p-1">${rData[tracker].taskComments[i].comment}</p></div></div>`;

            }
        }
        scrollToBottomComment();
    }
}

/* Scroll to bottom comment whenever any new comment is added or comment tab is updated */
function scrollToBottomComment(){
    let commentAreaScrollHeight = document.getElementById("comments-cont").scrollHeight;
    document.getElementById("comments-cont").scrollTop = commentAreaScrollHeight;
}

/* Sorting task list */
function sortList(x){
    // console.log(x)
    if(x === 'old-first'){
        updateTasks(rData,'tasks');
    }
    else if(x === 'new-first'){
        newFirst();
    }
    else if(x === 'prior-highToLow'){
        priorHtoL();
    }
    else{
        priorLtoH();
    }
}

function newFirst(){
    let x = document.querySelectorAll(".single-container");
    let newArray = [];
    for(let i = 0; i < x.length; i++){
        let s = x[i].firstChild.id
        s = s.substring(2,s.length)
        let y = s
        console.log(y)
        let obj = {
            elem : x[i],
            timeStamp : rData[y].time
        }
        newArray.push(obj)
    }
    console.log(newArray)
    console.log(rData)
    newArray.sort((a,b) => b.timeStamp - a.timeStamp);
    document.getElementById('tasks-list').innerHTML = "";
    for(let i = 0; i < newArray.length; i++){
        document.getElementById('tasks-list').appendChild(newArray[i].elem);
    }
}

function priorHtoL(){
    let x = document.querySelectorAll(".single-container");
    let newArray = [];
    for(let i = 0; i < x.length; i++){
        let s = x[i].firstChild.id
        s = s.substring(2,s.length)
        let y = s
        console.log(y)
        console.log(rData[y].time);
        let obj = {
            elem : x[i],
            priority : rData[y].taskPriority
        }
        if(obj.priority === 'hp'){
        newArray.push(obj)
        }
    }
    for(let i = 0; i < x.length; i++){
        let s = x[i].firstChild.id
        s = s.substring(2,s.length)
        let y = s
        console.log(y)
        console.log(rData[y].time);
        let obj = {
            elem : x[i],
            priority : rData[y].taskPriority
        }
        if(obj.priority === 'mp'){
        newArray.push(obj)
        }
    }
    for(let i = 0; i < x.length; i++){
        let s = x[i].firstChild.id
        s = s.substring(2,s.length)
        let y = s
        console.log(y)
        console.log(rData[y].time);
        let obj = {
            elem : x[i],
            priority : rData[y].taskPriority
        }
        if(obj.priority === 'lp'){
        newArray.push(obj)
        }
    }
    for(let i = 0; i < x.length; i++){
        let s = x[i].firstChild.id
        s = s.substring(2,s.length)
        let y = s
        console.log(y)
        console.log(rData[y].time);
        let obj = {
            elem : x[i],
            priority : rData[y].taskPriority
        }
        if(obj.priority === ''){
        newArray.push(obj)
        }
    }
    document.getElementById('tasks-list').innerHTML = "";
    for(let i = 0; i < newArray.length; i++){
        document.getElementById('tasks-list').appendChild(newArray[i].elem);
    }

}

function priorLtoH(){
    let x = document.querySelectorAll(".single-container");
    let newArray = [];
    for(let i = 0; i < x.length; i++){
        let s = x[i].firstChild.id
        s = s.substring(2,s.length)
        let y = s
        console.log(y)
        console.log(rData[y].time);
        let obj = {
            elem : x[i],
            priority : rData[y].taskPriority
        }
        if(obj.priority === ''){
        newArray.push(obj)
        }
    }
    for(let i = 0; i < x.length; i++){
        let s = x[i].firstChild.id
        s = s.substring(2,s.length)
        let y = s
        console.log(y)
        console.log(rData[y].time);
        let obj = {
            elem : x[i],
            priority : rData[y].taskPriority
        }
        if(obj.priority === 'lp'){
        newArray.push(obj)
        }
    }
    for(let i = 0; i < x.length; i++){
        let s = x[i].firstChild.id
        s = s.substring(2,s.length)
        let y = s
        console.log(y)
        console.log(rData[y].time);
        let obj = {
            elem : x[i],
            priority : rData[y].taskPriority
        }
        if(obj.priority === 'mp'){
        newArray.push(obj)
        }
    }
    for(let i = 0; i < x.length; i++){
        let s = x[i].firstChild.id
        s = s.substring(2,s.length)
        let y = s
        console.log(y)
        console.log(rData[y].time);
        let obj = {
            elem : x[i],
            priority : rData[y].taskPriority
        }
        if(obj.priority === 'hp'){
        newArray.push(obj)
        }
    }
    document.getElementById('tasks-list').innerHTML = "";
    for(let i = 0; i < newArray.length; i++){
        document.getElementById('tasks-list').appendChild(newArray[i].elem);
    }
}