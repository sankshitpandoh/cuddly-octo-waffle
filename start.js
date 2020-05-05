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
    app.post("/pandoh", function(req, res){
        // console.log(req.body.title)
        addTask(req.body)
        res.send("request processed")
    })

    //Api called when a task is to be removed
    app.post("/rmtask", function(req, res){
        fs.readFile('./data/tasks.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            dataArray.splice(req.body.id , 1);
            console.log(JSON.stringify(dataArray))    
            fs.writeFile("./data/tasks.json", JSON.stringify(dataArray), function(err){
              if (err) throw err;
              console.log('The file was modified');
            });
        })
        res.send("Task deleted")
    })

    //Api called to show data in realtion to which tab is opened
    app.post("/receiveData", function(req, res){
        console.log(req.body.id)
        fs.readFile('./data/' + req.body.id + '.json', function(err, Content){
            // Data not parsing properly, fix this 
            console.log("hi")
            console.log(JSON.parse(Content))
            res.json(JSON.parse(Content))
        })
    })
    function addTask(taskData){
        let task = {
            tasksTitle: taskData.title,
            tasksDescription : taskData.description,
            tasksDate : taskData.date,
            timeStamp : taskData.timeStamp,
            time: taskData.time
        } 
        let data = task
        fs.readFile('./data/tasks.json', function (err, OldData) {
            let dataArray = JSON.parse(OldData);
            dataArray.push(data);
            console.log(JSON.stringify(dataArray))    
            fs.writeFile("./data/tasks.json", JSON.stringify(dataArray), function(err){
              if (err) throw err;
              console.log('The task was appended to file!');
            });
        })

    }