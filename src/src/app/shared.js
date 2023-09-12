// shared ...

// load header and footer so it`s not hard coded on every view
$(function () {
    $("#footer").load("footer.html");
    $("#header").load("header.html");
});

// generate predictive words
function inAuto() {
    var predictions = []
    var q = document.getElementById("searchInput").value
    if (q === '' || q == null)
        return
    var url = `https://api.datamuse.com/words?sp=${q}*&max=10`
    fetch(url)
        .then(response => {
            return response.json();
        })
        .then(data => {
            data.forEach(wordInfo => {
                predictions.push(wordInfo.word)
            });
        })

    setTimeout(() => {
        autocomplete(predictions)
    }, 200)
}

// set autocomplete on input
function autocomplete(predictions) {
    var btn1 = document.getElementById("bt1")
    $("#searchInput").autocomplete({
        source: predictions,
        select: function (event, ui) { //ui.item.label
            document.getElementById("searchInput").innerText = ui.item.label
            setTimeout(() => {
                btn1.click()
                document.getElementById("searchInput").blur()
            }, 200)

        }
    })
}

function inAuto2() {
    var predictions = []
    var q = document.getElementById("searchInput2").value
    if (q === '' || q == null)
        return
    var url = `https://api.datamuse.com/words?sp=${q}*&max=10`
    fetch(url)
        .then(response => {
            return response.json();
        })
        .then(data => {
            data.forEach(wordInfo => {
                predictions.push(wordInfo.word)
            });
        })

    setTimeout(() => {
        autocomplete2(predictions)
    }, 200)
}

// set autocomplete on input
function autocomplete2(predictions) {
    var btn1 = document.getElementById("bt2")
    $("#searchInput2").autocomplete({
        source: predictions,
        select: function (event, ui) { //ui.item.label
            document.getElementById("searchInput2").innerText = ui.item.label
            setTimeout(() => {
                btn2.click()
                document.getElementById("searchInput2").blur()
            }, 200)

        }
    })
}

// Storing user session
// Function to save the session ID to browser`s localStorage
function saveSessionId() {
    const sessionId = generateSessionId();
    localStorage.setItem('sessionId', sessionId);
    // console.log('Session ID saved:', sessionId);
}

// Function to clear the session ID from localStorage
function clearSessionId() {
    localStorage.removeItem('sessionId');
    // console.log('Session ID cleared.');
}

// Function to generate a random session ID
function generateSessionId() {
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let sessionId = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        sessionId += charset[randomIndex];
    }
    return sessionId;
}

// Check if there is a saved session ID and display it on page load
document.addEventListener('DOMContentLoaded', () => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
        // console.log('Retrieved Session ID:', sessionId);
    } else {
        saveSessionId()
    }
});


// User session using pouchDB, initialization of variables
var db = new PouchDB('users_db');
var likedVideos = [] // an array of all liked videos



// set liked videos style
setTimeout(() => {
    var h = document.getElementById('searchInput').offsetHeight
    document.getElementById('homeLink').style.height = h + 'px'
    document.getElementById('likedVids').style.height = h + 'px'
    document.getElementById('likedVids').style.border = '1px solid #0d6efd'
    // console.log(h)
}, 200)

setTimeout(() => {
    document.getElementById("likedVids").onclick = function () {
        window.location.href = 'likedVideos.html'
    }
}, 300)

setTimeout(() => {
    document.getElementById("homeBtn").onclick = function () {
        window.location.href = 'index.html'
    }
}, 300)


var dbContrast = new PouchDB('contrast');
dbContrast.get('contrast')
    .then((doc) => {
        // console.log(doc)
        setContrast(doc.dark)
    })
    .catch(() => {
        dbContrast.put({
            _id: 'contrast',
            dark: false
        })
    })

function setContrast(dark) {
    if (dark) {
        document.body.classList.add("darkTheme")
        document.body.classList.remove("lightTheme")
        document.getElementById("searchInput").classList.add("fc-dark")
        // document.getElementById("searchInput2").classList.add("fc-dark")
        // console.log(document.getElementById("githubLink").src)
        // '/src/app/static/githubDark.png'
        document.getElementById("githubLink").src = 'static/githubLight.png'
        document.getElementById("githubFooter").src = 'static/githubLight.png'
        document.getElementById("contrastLink").src = 'static/daylight.png'

        var elements = document.getElementsByClassName("card");
        $(".card").each(function () {
            $(this).addClass("dark-bg");
        });
    } else {
        document.body.classList.add("lightTheme")
        document.body.classList.remove("darkTheme")
        document.getElementById("searchInput").classList.remove("fc-dark")
        // document.getElementById("searchInput2").classList.remove("fc-dark")
        document.getElementById("githubLink").src = 'static/githubDark.png'
        document.getElementById("githubFooter").src = 'static/githubDark.png'
        document.getElementById("contrastLink").src = 'static/darklight.png'
        $(".card").each(function () {
            $(this).removeClass("dark-bg");
        });
    }

}

setTimeout(() => {
    document.getElementById("contrastLink").onclick = function () {
        dbContrast.get('contrast')
            .then((doc) => {
                if (doc.dark) {
                    // console.log("setting to light")
                    setContrast(!doc.dark)
                    dbContrast.put({
                        _id: 'contrast',
                        _rev: doc._rev,
                        dark: false
                    })

                } else {
                    // console.log("setting to dark")
                    setContrast(!doc.dark)
                    dbContrast.put({
                        _id: 'contrast',
                        _rev: doc._rev,
                        dark: true
                    })
                }
            })
    }
}, 300)


