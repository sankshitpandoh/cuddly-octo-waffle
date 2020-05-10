    let express = require('express');
    const fs = require('fs')
    const bodyParser = require('body-parser')
    let app = express();

    app.use(express.static('public'));
    app.use(bodyParser.json({limit: '10mb', extended: true}));

    /*Start listening*/
    let server = app.listen(8000, function () {
        let host = server.address().address;
        let port = server.address().port;
        
        console.log("Keep Safe running at http://%s:%s", host, port)
    })

    //Api called when new task is added
    app.post("/sendtask", function(req, res){
        addTask(req.body)
        res.send("request processed")
    })

    //Api called when a task is to be removed
    // app.post("/rmtask", function(req, res){
    //     fs.readFile('./data/tasks.json', function (err, OldData) {
    //         let dataArray = JSON.parse(OldData);
    //         dataArray.splice(req.body.id , 1);
    //         console.log(JSON.stringify(dataArray))    
    //         fs.writeFile("./data/tasks.json", JSON.stringify(dataArray), function(err){
    //           if (err) throw err;
    //           console.log('The file was modified');
    //         });
    //     })
    //     res.send("Task deleted")
    // })

    //Api called to show data in realtion to which tab is opened
    app.post("/receiveData", function(req, res){
        console.log(req.body.id)
        fs.readFile('./data/data.json', function(err, Content){
            // Data not parsing properly, fix this 
            console.log("hi")
            console.log(JSON.parse(Content))
            res.json(JSON.parse(Content))
        })
    })
    function addTask(taskData){
        let task = {
            tasksTitle: taskData.title,
            time: taskData.timeStamp,
            taskDeadline : "",
            taskPriority : "",
            taskSubtasks : "",
            taskDetails : "",
            completed : 0
        } 
        let data = task
        fs.readFile('./data/data.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            dataArray.push(data);
            console.log(JSON.stringify(dataArray))    
            fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
              if (err) throw err;
              console.log('The task was appended to file!');
            });
        })

    }


    //Api called when user adds or changes the details for a single task
    app.post("/sendDetails", function(req, res){
        console.log(req.body);
        fs.readFile('./data/data.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            dataArray[req.body.trackTask].taskDeadline = req.body.deadLine;
            dataArray[req.body.trackTask].taskSubtasks = req.body.subTasks;
            dataArray[req.body.trackTask].taskPriority = req.body.priority;
            dataArray[req.body.trackTask].taskDetails = req.body.tdetails;
            // console.log(dataArray[req.body.trackTask])
            // dataArray.push(data);
            console.log(JSON.stringify(dataArray))    
            fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
              if (err) throw err;
              console.log('The details were successfully appended to task' + req.body.trackTask);
            });
        });
        res.send("Details added")
    });

    // API called when the user completes a task
    app.post("/completed", function(req, res){
        fs.readFile('./data/data.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            dataArray[req.body.id].completed = 1;
            // console.log(dataArray[req.body.trackTask])
            // dataArray.push(data);
            console.log(JSON.stringify(dataArray))    
            fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
              if (err) throw err;
              console.log('The completion of task was successfully updated' + req.body.trackTask);
            });
        });
        res.send("Data Updated")
    })

    // API called when the user unchecks a completed task
    app.post("/notCompleted", function(req, res){
        fs.readFile('./data/data.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            dataArray[req.body.id].completed = 0;
            // console.log(dataArray[req.body.trackTask])
            // dataArray.push(data);
            console.log(JSON.stringify(dataArray))    
            fs.writeFile("./data/data.json", JSON.stringify(dataArray), function(err){
              if (err) throw err;
              console.log('The completion of task was successfully updated' + req.body.trackTask);
            });
        });
        res.send("Data Updated")
    })
