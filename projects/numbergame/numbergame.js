/**
 * Number Game Manager
 *
 * Can also be used for other types of guessing games, since all of the display and question generation
 * is handled by the using application.
 */

var Game = Game || (Game = {});

(function() {
    // Events
    inject({
        "onstart": function() { },
        "onquestion": function() { },
        "onwrong": function() { },
        "onend": function() { },
        "onsuccess": function() { },
        "onendquestion": function() { },
        "onfinish": function() { },
        "generate": function() { return { "text": "", "answer": 0 }; }
    });
    
    // Configuration options
    inject({
        "maxtries": 3,
        "defaultscore": 3,
        "scorechange": 1,
        "endscore": -1
    });
    
    // Default functions
    inject({
        "start": function() {
            score = 0;
            totalscore = 0;
            
            Game.onstart();
            doQuestion();
        }
    });
    
    var score = 0, totalscore = 0;
    function doQuestion() {
        var question = Game.generate(), tries = 0;
        
        inject("answer", function(c) {
            if (c == question.answer) {
                score += Game.defaultscore - (Game.scorechange * tries);
                totalscore += Game.defaultscore;
                
                Game.onsuccess(c);
                Game.onendquestion(score / totalscore * 100, score, true, question.answer);
                doQuestion();
            } else {
                tries++;
                if (tries >= Game.maxtries) {
                    var finish = Game.onend();
                    if (finish) {
                        Game.onendquestion(score / totalscore * 100, score, false, question.answer);
                        Game.onfinish();
                    } else {
                        score += Game.endscore;
						if (score < 0) score = 0;
						
                        totalscore += Game.defaultscore;
                        Game.onendquestion(score / totalscore * 100, score, false, question.answer);
                        doQuestion();
                    }
                } else Game.onwrong(Game.maxtries - tries);
            }
        });
        Game.onquestion(question.text);
    }
    
    // Injects an object into the Game object
    function inject(object) {
        if (arguments.length > 1) {
            var o = {};
            o[arguments[0]] = arguments[1];
            object = o;
        }
        for (var k in object) {
            if (object.hasOwnProperty(k)) {
                Game[k] = object[k];
            }
        }
    }
}());