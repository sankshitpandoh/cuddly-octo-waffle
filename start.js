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
    // showTasks()
    // function showTasks(){
    //     app.get('./data/tasks.json', (req, res) => res.send('Hello World!'))
    // }
    app.post("/pandoh", function(req, res){
        // console.log(req.body.title)
        addTask(req.body)
    })
    app.post("/receiveData", function(req, res){
        console.log(req.body.id)
        let sData
        fs.readFile('./data/' + req.body.id + '.json', function(err, Content){
            // Data not parsing properly, fix this 
            console.log("hi")
            sData = JSON.parse(Content)
            // sData = JSON.stringify(Content)
            console.log(sData[0])
        })
        res.json(sData)
    })
    function addTask(taskData){
        let task = {
            "taskTitle": taskData.title,
            "taskDescription" : taskData.description,
            "taskDate" : taskData.date
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