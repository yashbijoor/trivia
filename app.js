const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();
const listOfCorrectOptions = []; //List of correct options as the local 'correctOption' does not sync with the user selected option
var flag = 0; //Stores the number of iterations i.e. the no of questions the user will answer
var scoreCount = 0; //Stores the score
var GlobalCategory = []; //Stores the category chosen by the user

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
  res.render("home");
});

app.post("/", function(req, res){
  var category = parseInt(req.body.category); //local category
  GlobalCategory.push(category);
  chosenOption = parseInt(req.body.options); //Local user option 
  request("https://opentdb.com/api.php?amount=1&category=" + GlobalCategory[0] + "&type=multiple", function(error, response, body){  
  if(error){
      res.render("failure");
    }else if(response.statusCode != 200){
      res.render("failure");
    }else{
      const data = JSON.parse(body);
      const question = data.results[0].question;
      const optionList = [];
      const options = data.results[0].incorrect_answers;
      flag++;
      const correctOption = data.results[0].correct_answer;
      let option = parseInt(Math.floor((Math.random() * 4)));
      listOfCorrectOptions.push(option); 
      var count = 0; //To know when to push the options in the array
      for(var i = 0; i<=3; i++){
        if(option === i){
          optionList.push(correctOption);
        }else{
          optionList.push(options[count]);
          count++
        }
      }
      // The index of 'listOfCorrectOptions' is flag-2 cuz the list is 2 indices behind the user chosen option
      if(chosenOption-1 === listOfCorrectOptions[flag-2]){
        scoreCount++;
      }
      if(flag > 10){
        res.render("dashboard", {score: scoreCount});
      }else if(flag === 10){
        res.render("quiz",{question: question, optionList: optionList, score: scoreCount, button: "FINISH"});
      }else{
        res.render("quiz",{question: question, optionList: optionList, score: scoreCount, button: "CONTINUE"});
      }
    }
  });
});


app.post("/dashboard", function(req, res){
  scoreCount = 0; // Beginning the score from 0 for the next iteration
  GlobalCategory = []; //Emptying the category array for the next iteration
  flag = 0; // Flag is 0 for the next iteration
  res.redirect("/");
})

app.post("/failure", function(req, res){
  res.redirect("/");
});

app.listen(3000, function(){
    console.log("Server is running on port 3000");
  });