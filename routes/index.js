import express from 'express';
var router = express.Router();

import SpeakerService from "../services/SpeakerService.js";
let speaker = new SpeakerService();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get("/sound/pwm", pwmTest);
router.get("/sound/pwm/:filename", playSound);
router.get("/sound/:filename", playPwmStream);



function playSound(req, res, next){
  let filename = req.params.filename;
  speaker.playSound(filename)
      .then(function(result){
        res.send(200)
      })
      .catch(function(err){
        next(err);
      });
}
function pwmTest(req, res, next){
    speaker.playPwmTest()
        .then(function(result){
            res.send(200)
        })
        .catch(function(err){
            next(err);
        });
}

function playPwmStream(req, res, next){
    let filename = req.params.filename;
    speaker.playPwmStream(filename)
        .then(function(result){
            res.send(200)
        })
        .catch(function(err){
            next(err);
        });
}



export default router