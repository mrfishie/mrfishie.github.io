// panels
var $panel1 = document.getElementById("panel-1");
var $panel2 = document.getElementById("panel-2");
var $panel3 = document.getElementById("panel-3");

var panels = [$panel1, $panel2, $panel3];
var panelHandlers = [false, false, gotoLyrics];

var currentPanelId = 0;
var $currentPanel = $panel1;

// form components
var $btnStart = document.getElementById("btn-start");
var $selectDays = document.getElementById("select-days");
var $textName = document.getElementById("text-name");
var $btnDone = document.getElementById("btn-done");
var $btnBack = document.getElementById("btn-back");

// containers
var $options = document.getElementById("options");
var $lyrics = document.getElementById("lyrics");

// word components
var $titlePlural = document.getElementById("title-plural");
var $lyricsDays = document.getElementById("lyrics-days");
var $lyricsPlural = document.getElementById("lyrics-plural");
var $lyricsType = document.getElementById("lyrics-type");
var $permalink = document.getElementById("permalink");

// templates
var $optionTemplate = document.querySelector(".templates .option");

function switchPanel(id) {
    currentPanelId = id;
    window.location.hash = "#" + encodeFormat();

    if (typeof panelHandlers[id] === "function") panelHandlers[id]();

    // animate scrolling
    var targetScroll = 0;
    var currentScroll = window.scrollY;
    var diff = targetScroll - currentScroll;
    var step = diff / 200;

    if (step !== 0) {
        var startTime = Date.now();
        var animateInterval = setInterval(function () {
            var currentTime = Date.now();

            var result = Math.round(currentScroll + step * (currentTime - startTime));
            window.scrollTo(window.scrollX, result);

            if ((step <= 0 && result <= targetScroll) || (step > 0 && result >= targetScroll)) {
                window.scrollTo(window.scrollX, targetScroll);
                clearInterval(animateInterval);
            }
        }, 1000 / 60);
    }

	// start the current panel fading out
	$currentPanel.style.opacity = 0;
	
	var $newPanel = panels[id];
	$newPanel.style.display = "block";
	$newPanel.style.opacity = 1;
	$newPanel.style.zIndex = -1;
	
	setTimeout(function() {
		$currentPanel.style.display = "none";
		$newPanel.style.zIndex = "";
		$currentPanel = $newPanel;
	}, 200);
}

$btnStart.addEventListener('click', function() {
	switchPanel(1);
});

$btnDone.addEventListener('click', function() {
    switchPanel(2);
});

function gotoLyrics() {
    var dayName = numberNames[objects.length - 1];
    if (objects.length === 1) {
        dayName = "One";
        $lyricsPlural.style.display = "none";
    } else $lyricsPlural.style.display = "";

    $lyricsDays.textContent = dayName;
    $lyricsType.textContent = $textName.value;

    var currentUrl = window.location.toString();
    //$permalink.textContent = currentUrl;
    $permalink.href = currentUrl;

    generateLyrics();
    //switchPanel(2);
}

$btnBack.addEventListener('click', function() {
    switchPanel(1);
});

var ownerName = "true love";

var defaultObjects = [
	"Partridge in a Pear Tree",
	"Turtle Doves",
	"French Hens",
	"Calling Birds",
	"Gold Rings",
	"Geese a-Laying",
	"Swans a-Swimming",
	"Maids a-Milking",
	"Ladies Dancing",
	"Lords a-Leaping",
	"Pipers Piping",
	"Drummers Drumming"
];
var defaultCache = defaultObjects.slice();
var defaultEmpty = "Lots of Something";

var objects = defaultObjects.slice();

var dayNames = [
	"first",
	"second",
	"third",
	"fourth",
	"fifth",
	"sixth",
	"seventh",
	"eighth",
	"ninth",
	"tenth",
	"eleventh",
	"twelfth",
	"thirteenth",
	"fourteenth",
	"fifteenth",
	"sixteenth",
	"seventeenth",
	"eighteenth",
	"nineteenth",
	"twentieth"
];

var numberNames = [
	"A",
	"Two",
	"Three",
	"Four",
	"Five",
	"Six",
	"Seven",
	"Eight",
	"Nine",
	"Ten",
	"Eleven",
	"Twelve",
	"Thirteen",
	"Fourteen",
	"Fifteen",
	"Sixteen",
	"Seventeen",
	"Eighteen",
	"Nineteen",
	"Twenty"
];

var vowels = ["a", "e", "i", "o", "u"];

function getNumberName(index, text) {
    if (index > 0) return numberNames[index];

    var firstCharacter = text.toLowerCase().charAt(0);
    if (vowels.indexOf(firstCharacter) === -1) return numberNames[0];
    return "An";
}

if (window.location.hash) {
    var hashValue = window.location.hash.substr(1);

    // V8 optimization
    (function() {
        try {
            decodeFormat(hashValue);
        } catch (ex) { }
    }());
}

function creatorRegenObjects() {
	// remove all children
	while ($options.firstChild) $options.removeChild($options.firstChild);
	
	for (var i = 0; i < objects.length; i++) {
		addObject(i);
	}
}
creatorRegenObjects();

function createObjectTail(i, $optionPrevious) {
    while ($optionPrevious.firstChild) $optionPrevious.removeChild($optionPrevious.firstChild);
    var tailItems = generateTail(i - 1, 6/*Math.max(2, Math.ceil(i / 2))*/, true);

    var $appendElt = $optionPrevious;
    for (var x = 0; x < tailItems.length; x++) {
        var tailContent = tailItems[x];

        if (i - 1 - x === 0) tailContent += ".";
        else if (x === tailItems.length - 1) tailContent += "...";

        var $elt = document.createElement("span");
        $elt.textContent = tailContent;
        $appendElt.appendChild($elt);

        $appendElt = $elt;
    }
}

function addObject(i) {
	var $option = $optionTemplate.cloneNode(true);
	$option.id = "option-" + i;
	
	var $optionDay = $option.querySelector(".day");
	var $optionType = $option.querySelector(".type");
	var $optionWho = $option.querySelector(".text-who");
	var $optionVerb = $option.querySelector(".verb");
	var $optionWhat = $option.querySelector(".text-what");
    var $optionPrevious = $option.querySelector(".previous");
	
	$optionDay.textContent = dayNames[i];
	$optionType.textContent = $textName.value;
	$optionWho.value = ownerName;
	$optionVerb.textContent = getNumberName(i, objects[i]);
	$optionWhat.value = objects[i];

    if (i > 0) createObjectTail(i, $optionPrevious);
	
	$optionWho.addEventListener('keydown', function() {
		setTimeout(function() {
			ownerName = $optionWho.value;
			creatorUpdateOwner(i);

            window.location.hash = "#" + encodeFormat();
		}, 0);
	});

	$optionWhat.addEventListener('keydown', function() {
		setTimeout(function() {
            defaultObjects[i] = objects[i] = $optionWhat.value;

            $optionVerb.textContent = getNumberName(i, objects[i]);

            // Update all other later objects
            for (var x = i + 1; x < objects.length; x++) {
                var $previousOpt = $options.querySelector("#option-" + x + " .previous");
                createObjectTail(x, $previousOpt);
            }

            /*if (i < objects.length - 1) {
                var $previousItem = $options.querySelector("#option-" + (i + 1) + " .previous");

                /*var numberName = getNumberName(i, objects[i]);
                if (i === 0) numberName = "And " + numberName.toLowerCase();
                $previousItem.textContent = numberName + " " + objects[i]
                    + (i > 0 ? "..." : ".");*
            }*/

            window.location.hash = "#" + encodeFormat();
        }, 0);
	});
	
	$options.appendChild($option);
}

function creatorUpdateLength() {
	var newLength = parseInt($selectDays.value, 10);
    if (newLength === 1) $titlePlural.style.display = "none";
    else $titlePlural.style.display = "";

	var currentLength = objects.length;
	
	if (newLength === currentLength) return;
	
	if (newLength < currentLength) {
		objects = objects.slice(0, newLength);
		for (var i = newLength; i < currentLength; i++) {
			var $optionToRemove = $options.querySelector("#option-" + i);
			$options.removeChild($optionToRemove);
		}
	} else {
		for (var i = currentLength; i < newLength; i++) {
			objects.push(defaultObjects[i] || defaultEmpty);
			addObject(i);
		}
	}

    window.location.hash = "#" + encodeFormat();
}
$selectDays.addEventListener('change', creatorUpdateLength);
creatorUpdateLength();

function creatorUpdateOwner(exclude) {
	for (var i = 0; i < objects.length; i++) {
		if (i === exclude) continue;
		
		var $elt = document.querySelector("#option-" + i + " .text-who");
		$elt.value = ownerName;
	}

    window.location.hash = "#" + encodeFormat();
}

function creatorUpdateType() {
	for (var i = 0; i < objects.length; i++) {
		var $elt = document.querySelector("#option-" + i + " .type");
		$elt.textContent = $textName.value;
	}

    window.location.hash = "#" + encodeFormat();
}
$textName.addEventListener('keydown', function() {
	setTimeout(creatorUpdateType, 0);
});

function generateTail(start, limit, allowAnd) {
    limit = limit || 0;

    var result = [], done = 0;
    for (var i = start; i >= 0; i--) {
        var numberName = getNumberName(i, objects[i]);
        if ((allowAnd || start !== 0) && i === 0) numberName = "and " + numberName.toLowerCase();
        result.push(numberName + " " + objects[i]);

        done++;
        if (limit !== 0 && done >= limit) break;
    }

    return result;
}

function generateItem(i) {
    var $elt = document.createElement("p");

    var $initialLine = document.createElement("span");
    $initialLine.textContent = "On the " + dayNames[i] + " day of " + $textName.value + ", my " + ownerName + " gave to me";
    $elt.appendChild($initialLine);

    //$elt.appendChild(document.createElement("br"));

    var tailItems = generateTail(i);
    for (var x = 0; x < tailItems.length; x++) {
        var $tailItem = document.createElement("span");
        $tailItem.textContent = tailItems[x] + (x === tailItems.length - 1 ? "." : ",");
        $elt.appendChild($tailItem);

        //if (x !== tailItems.length - 1) $elt.appendChild(document.createElement("br"));
    }

    return $elt;
}

function generateLyrics() {
    // clear previous lyrics
    while ($lyrics.firstChild) $lyrics.removeChild($lyrics.firstChild);

    for (var i = 0; i < objects.length; i++) {
        var $elt = generateItem(i);
        $lyrics.appendChild($elt);
    }
}

function decodeFormat(data) {
    var items = JSON.parse("[" + atob(data) + "]");

    if (items.length < 4) throw new Error("Invalid input");

    var panel = parseInt(items[0]);
    if (isNaN(panel)) throw new Error("Invalid panel ID");

    $textName.value = items[1];
    ownerName = items[2];
    var objs = items.slice(3);

    objects = objs.map(function(obj, i) {
        return obj || objects[i];
    });

    $selectDays.value = objects.length.toString();
    switchPanel(panel);
}

function encodeFormat() {
    var items = [
        currentPanelId,
        $textName.value,
        ownerName
    ];

    for (var i = 0; i < objects.length; i++) {
        var val = objects[i];
        if (val === defaultCache[i] || i >= defaultCache.length && val === defaultEmpty) items.push(0);
        else items.push(val);
    }

    var stringified = JSON.stringify(items);
    return btoa(stringified.substring(1, stringified.length - 1));
}