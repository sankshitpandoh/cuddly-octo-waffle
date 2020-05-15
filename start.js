    let express = require('express');
    const fs = require('fs')
    const bodyParser = require('body-parser')
    let app = express();

    /* Setting environment var port to get the port number which the environment provided or use 8000 */
    const port = process.env.PORT || 8000;

    app.use(express.static('public'));
    app.use(bodyParser.json({limit: '10mb', extended: true}));

    /*Start listening*/
    let server = app.listen(port, function () {
        let host = server.address().address;
        let port = server.address().port;
        
        console.log("Keep Safe running at http://%s:%s", host, port)
    })

    //Api called when new task is added
    app.post("/sendtask", function(req, res){
        addTask(req.body)
        res.send("request processed")
    })

    // Function called when a new task is added
    function addTask(taskData){
        let task = {
            tasksTitle: taskData.title,
            time: taskData.timeStamp,
            taskDeadline : "",
            taskDeadlineTime : "",
            taskPriority : "",
            taskSubtasks : [],
            taskComments : [],
            completed : 0
        } 
        let data = task
        fs.readFile('./data/data.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            dataArray.push(data);
            // console.log(JSON.stringify(dataArray))    
            fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
              if (err) throw err;
              console.log('The task was appended to file!');
            });
        })

    }

    //Api called when a task is to be removed
    app.post("/rmtask", function(req, res){
        fs.readFile('./data/data.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            dataArray.splice(req.body.id , 1);
            console.log(req.body.id)
            fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
              if (err) throw err;
              console.log('The file was modified');
            });
        });
        res.send("Task deleted");
    });

    //Api called to show data in realtion to which tab is opened
    app.post("/receiveData", function(req, res){
        console.log(req.body.id)
        if(req.body.id === "compTasks"){
            fs.readFile('./data/completedTask.json', function(err, Content){
                // Data not parsing properly, fix this 
                res.json(JSON.parse(Content))
            });
        }
        else{
            fs.readFile('./data/data.json', function(err, Content){
                // Data not parsing properly, fix this 
                res.json(JSON.parse(Content))
            });
        }
    })

    //Api called when user adds or changes the details for a single task
    app.post("/sendDetails", function(req, res){
        console.log(req.body);
        fs.readFile('./data/data.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            dataArray[req.body.trackTask].taskDeadline = req.body.deadLine;
            dataArray[req.body.trackTask].taskDeadlineTime = req.body.deadLineTime;
            // dataArray[req.body.trackTask].taskSubtasks = req.body.subTasks;
            dataArray[req.body.trackTask].taskPriority = req.body.priority;
            // dataArray[req.body.trackTask].taskDetails = req.body.tdetails;
            console.log(JSON.stringify(dataArray));
            fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
              if (err) throw err;
              console.log('The details were successfully appended to task' + req.body.trackTask);
            });
        });
        res.send("Details added")
    });

    /* Api called when user adds a subtask */
    app.post("/getSubTask", function(req, res){
        fs.readFile('./data/data.json', function(err, OldData){
            let dataArray = JSON.parse(OldData);
            let sObj = {
                sTask : req.body.sTask,
                completed : req.body.complete
            }
            dataArray[req.body.trackTask].taskSubtasks.push(sObj);
            fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
                if (err) throw err;
                console.log('The subTask ' + req.body.sTask + ' were successfully appended to task' + req.body.trackTask);
              });
        });
        res.send("Sub Task added")
    });

    /* Api called when user completes a sub task */
    app.post("/subTComp", function(req, res){
        fs.readFile('./data/data.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            dataArray[req.body.tTrack].taskSubtasks[req.body.subId].completed = 1;
            fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
              if (err) throw err;
              console.log('The completion of task was successfully updated ' + req.body.id);
            });
        });
        res.send("Data Updated")
    })

        /* Api called when user un checks completion of a sub task */
        app.post("/subTUnComp", function(req, res){
            fs.readFile('./data/data.json', function (err, OldData) {
                let dataArray = JSON.parse(OldData);
                dataArray[req.body.tTrack].taskSubtasks[req.body.subId].completed = 0;
                fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
                  if (err) throw err;
                  console.log('The completion of task was successfully updated ' + req.body.id);
                });
            });
            res.send("Data Updated")
        })

        /* Api called when user deletes a sub Task */
        app.post("/removeSub", function(req, res){
            fs.readFile('./data/data.json', function (err, OldData) {
                let dataArray = JSON.parse(OldData);
                dataArray[req.body.tTrack].taskSubtasks.splice(req.body.subId,1);
                fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
                  if (err) throw err;
                  console.log('sub task was sucessfully removed ' + req.body.id);
                });
            });
            res.send("Data Updated")
        })

    // API called when the user completes a task
    app.post("/completed", function(req, res){
        fs.readFile('./data/data.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            dataArray[req.body.id].completed = 1;
            for(let i = 0; i < dataArray[req.body.id].taskSubtasks.length; i++ ){
                dataArray[req.body.id].taskSubtasks[i].completed = 1;
            }
            fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
              if (err) throw err;
              console.log('The completion of task was successfully updated ' + req.body.id);
            });
        });
        res.send("Data Updated")
    })

    // API called when the user unchecks a completed task
    app.post("/notCompleted", function(req, res){
        fs.readFile('./data/data.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            dataArray[req.body.id].completed = 0;
            for(let i = 0; i < dataArray[req.body.id].taskSubtasks.length; i++ ){
                dataArray[req.body.id].taskSubtasks[i].completed = 0;
            }
            fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
              if (err) throw err;
              console.log('The completion of task was successfully updated ' + req.body.id);
            });
        });
        res.send("Data Updated")
    })


    // To shift data from data.json to completedtasks.json but only on wednesday and Friday (acts as a cronjob)
    let today = new Date();
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let day = today.getDay();
    let compArray = [];
    if(days[day] === "Wednesday" || days[day] === "Friday"){
        fs.readFile('./data/data.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            for(let i = (dataArray.length - 1); i > 0 ; i--){
                if(dataArray[i].completed === 1){
                    compArray.push(dataArray[i])
                    dataArray.splice(i,1)
                }
            }
        console.log(dataArray)
            fs.readFile('./data/completedTask.json', function (err, OldData) {
                let cData = JSON.parse(OldData);
                for(let i = 0; i < compArray.length; i++){
                    cData.push(compArray[i])
                }
                fs.writeFile("./data/completedTask.json", JSON.stringify(cData), function(err){
                if (err) throw err;
                console.log('Completed tasks were sucessfully appeneded to completed data file');
                });
            });
            fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
                if (err) throw err;
                console.log('Completed tasks were sucessfully removed from main data file');
                });
        });
    }


