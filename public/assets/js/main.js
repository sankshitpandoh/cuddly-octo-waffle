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

let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November','December'];
getUserName();
startClock();

//Load default content - summary
loadContent("tasks")

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
            if(rData.length < 2 && id != "goals"){
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
                    console.log('crashed')
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
        document.getElementById(id + "-list").innerHTML += `<div class="single-task d-flex my-2" id="task-${i}" onclick="expandTask(this)"><h3 class="mx-2">${rData[i].tasksTitle} </h3></div>`
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
    // let y = document.querySelectorAll(".single-task");
    // for(let i = 0 ; i < y.length; i++){
    //     y[i].style.maxHeight = `50px`;
    // }
    // x.style.maxHeight = "100%";
}
function displayTaskDetails(x){
    console.log(rData)
    let taskNumber = x.substring(5,(x.length));
    tracker = taskNumber
    document.getElementById("deadline-date").value = rData[taskNumber].taskDeadline;
    document.getElementById("sub-tasks").value = rData[taskNumber].taskSubtasks;
    document.getElementById("prior").value = rData[taskNumber].taskPriority;
    document.getElementById("details").value = rData[taskNumber].taskDetails;
}

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
        document.getElementById("High-p-tasks").innerHTML += `<div class="single-H-task d-flex my-2" id="task-${hTracker[i]}" onclick="expandTask(this)"><h3 class="mx-3">${hPrior[i].tasksTitle} </h3></div>`
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
        document.getElementById("Medium-p-tasks").innerHTML += `<div class="single-M-task d-flex my-2" id="task-${mTracker[i]}" onclick="expandTask(this)"><h3 class="mx-3">${mPrior[i].tasksTitle} </h3></div>`
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
        document.getElementById("Low-p-tasks").innerHTML += `<div class="single-L-task d-flex my-2" id="task-${lTracker[i]}" onclick="expandTask(this)"><h3 class="mx-3">${lPrior[i].tasksTitle} </h3></div>`
    }
}

//Remove the selected task
// function taskRemove(x,i){
//     let identify ={
//         id : i
//     }
//     let xhttp = new XMLHttpRequest();
//     xhttp.open("POST" , "http://localhost:8000/rmtask" , true);
//     xhttp.setRequestHeader("Content-Type","application/json; charset=utf-8");
//     xhttp.send((JSON.stringify(identify)));
//     xhttp.onreadystatechange = function(){
//         if (this.readyState == 4 && this.status == 200) {
//             // If the task is successfully removed from server, update the data on tasks
//             updateData("tasks")
//         }
//     }
// }

// Update Goals
// function updateGoals(rData,id){
//     console.log(id)
//     console.log(rData)
//     let currentMonth = today.getMonth();
//     console.log(months[currentMonth]);
//     document.getElementById("goals-list").innerHTML = "";
//     for(let i = currentMonth; i < 12; i++){
//         document.getElementById("goals-list").innerHTML += `<div class = "col-4 mb-4">
//                                                                 <h3 class="text-center mb-2">${months[i]}</h3>
//                                                                 <div class="single-month d-flex flex-column py-3 px-2" id="month-${i}" onclick="openGoals(this.id)">
//                                                                 </div>
//                                                             </div>` 
//     }
//     for(let i = currentMonth; i < 12; i++){
//         console.log(rData[i][i].length)
//         document.getElementById("month-" + i).innerHTML = ""
//         for(let j = 1; j < rData[i][i].length; j++){
//             if(j > 7){
//                 // To stop the loop when number of inner items increases 7
//                 // Only display 7 maximum gaols in calender view
//                 break
//             }
//             else{
//             // rData[i][i][j] is used to access inner properties from json file of goals
//             document.getElementById("month-" + i).innerHTML += `<h5 class="text-center mb-2">${rData[i][i][j].goalTitle}</h5>`
//             }

//         }
//     }

// }

// Open selected month goal list
// function openGoals(x){
//     document.getElementById("single-month-tab").style.display ="flex";
//     let month = x.substring(6,x.length);
//     document.getElementById("goal-month").innerHTML = months[month];
//     displayGoals(month)
// }

//Close the goals tab
// function closeGoals(){
//     // document.getElementById("sub-tasks").value = "";
//     document.getElementById("single-month-tab").style.display ="none";
// }

// Display goals month wise on opened tab
// function displayGoals(x){
//     document.getElementById("g-list").innerHTML = ""
//     if(rData[x][x].length < 2){
//         document.getElementById("g-list").innerHTML = `<h3 class="ml-2">Oops! You have no goals for ${months[x]} </h3>
//                                                         <h3 class="ml-2">Add one now!</h3>`
//     }
//     else{
//         for(let i = 1; i < rData[x][x].length; i++ ){
//             console.log('hi')
//             document.getElementById("g-list").innerHTML += `<div class="single-goal m-2" onclick="expandGoals(this)">
//                                                                 <h5 class="text-left ml-2 mb-2">${rData[x][x][i].goalTitle}</h5>
//                                                                 <p class="ml-2 mb-2">${rData[x][x][i].goalDescription}</p>
//                                                                 <div class="options row pl-0">
//                                                                 <div class="col-4">
//                                                                     <div class="single-option px-2 d-flex align-items-center justify-content-between" onclick="taskRemove(this,${i})">
//                                                                         <p>Delete</p>
//                                                                         <i class="fa fa-trash"></i>
//                                                                     </div>
//                                                                 </div>
//                                                                 <div class="col-4">
//                                                                     <div class="single-option px-2 d-flex align-items-center justify-content-between" onclick="taskRemove(this)">
//                                                                         <p>Completed</p>
//                                                                         <i class="fa fa-check"></i> 
//                                                                     </div>    
//                                                                 </div>
//                                                             </div>
//                                                             </div>`
//         }
//     }
// }

//To expand selected goals to view details
// function expandGoals(x){
//     console.log(x)
//     let y = document.querySelectorAll(".single-goal");
//     for(let i = 0 ; i < y.length; i++){
//         y[i].style.height = `25px`;
//     }
//     x.style.height = "auto";
// }
